import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

/**
 * @class AuthService
 * @description Serviço responsável por toda a lógica de autenticação e autorização da aplicação.
 * Gerencia registro de usuários, login, refresh tokens e validação de credenciais usando JWT.
 *
 * Implementa sistema de segurança com:
 * - Hashing de senhas com bcrypt (12 salt rounds)
 * - JWT access tokens (curta duração)
 * - JWT refresh tokens (30 dias, persistidos no banco)
 * - Rotação automática de refresh tokens
 *
 * @example
 * ```typescript
 * // Registrar novo usuário
 * const result = await authService.register({
 *   email: 'user@example.com',
 *   password: 'senha123',
 *   firstName: 'João',
 *   lastName: 'Silva'
 * });
 * ```
 */
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * @method register
   * @description Registra um novo usuário no sistema. Valida unicidade do email, faz hash da senha
   * com bcrypt (12 rounds) e gera tokens JWT para autenticação imediata.
   *
   * @param {RegisterDto} registerDto - Dados do novo usuário (email, senha, nome, telefone)
   * @returns {Promise<{access_token: string, refresh_token: string, user: Omit<User, 'password'>}>}
   *          Tokens JWT e dados sanitizados do usuário (sem senha)
   *
   * @throws {ConflictException} Se já existir usuário com o email fornecido
   *
   * @example
   * ```typescript
   * const result = await authService.register({
   *   email: 'player@poker.com',
   *   password: 'segura123',
   *   firstName: 'João',
   *   lastName: 'Silva',
   *   phone: '+5511999999999' // opcional
   * });
   * // { access_token: 'eyJ...', refresh_token: 'eyJ...', user: {...} }
   * ```
   */
  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, phone } = registerDto;

    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('User already exists with this email');
      }
    } catch (error) {
      console.error('❌ Database error in register - Check if user exists:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    try {
      // Hash password with bcrypt (salt rounds: 12 for strong security)
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone, // Optional phone number for future MFA/notifications
        },
      });

      console.log('✅ User created successfully:', email);

      // Generate JWT tokens (access + refresh)
      const tokens = await this.generateTokens(user);

      return {
        ...tokens,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      console.error('❌ Error during registration:', error);
      throw error;
    }
  }

  /**
   * @method login
   * @description Autentica um usuário existente. Valida email e senha, gerando novos tokens JWT em caso de sucesso.
   * Por segurança, retorna mensagem genérica para credenciais inválidas (não revela se email existe).
   *
   * @param {LoginDto} loginDto - Credenciais do usuário (email e senha)
   * @returns {Promise<{access_token: string, refresh_token: string, user: Omit<User, 'password'>}>}
   *          Tokens JWT e dados sanitizados do usuário
   *
   * @throws {UnauthorizedException} Se email não existe ou senha incorreta
   *
   * @example
   * ```typescript
   * const result = await authService.login({
   *   email: 'player@poker.com',
   *   password: 'segura123'
   * });
   * ```
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * @method refreshToken
   * @description Renova os tokens JWT usando um refresh token válido. Implementa rotação de refresh tokens:
   * o token antigo é invalidado e um novo par de tokens é gerado. Validação em duas camadas (JWT signature + banco de dados).
   *
   * @param {RefreshTokenDto} refreshTokenDto - Objeto contendo o refresh token
   * @returns {Promise<{access_token: string, refresh_token: string, user: Omit<User, 'password'>}>}
   *          Novo par de tokens JWT e dados do usuário
   *
   * @throws {UnauthorizedException} Se token inválido, expirado ou não existe no banco
   *
   * @example
   * ```typescript
   * const result = await authService.refreshToken({
   *   refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
   * });
   * ```
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // Check if refresh token exists in database
      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(tokenRecord.user);

      // Remove old refresh token (rotation strategy)
      await this.prisma.refreshToken.delete({
        where: { token: refreshToken },
      });

      return {
        ...tokens,
        user: this.sanitizeUser(tokenRecord.user),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * @method logout
   * @description Invalida um refresh token, realizando logout do usuário. Remove o token do banco de dados
   * para prevenir uso futuro.
   *
   * @param {RefreshTokenDto} refreshTokenDto - Objeto contendo o refresh token a ser invalidado
   * @returns {Promise<{message: string}>} Mensagem de confirmação
   *
   * @example
   * ```typescript
   * await authService.logout({ refreshToken: 'eyJhbGciOiJIUzI1...' });
   * ```
   */
  async logout(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
    return { message: 'Logged out successfully' };
  }

  /**
   * @method validateUser
   * @description Valida um usuário a partir do payload do JWT. Usado pela estratégia JWT do Passport
   * para recuperar dados completos do usuário em cada requisição autenticada.
   *
   * @param {any} payload - Payload decodificado do JWT (contém sub: userId)
   * @returns {Promise<User>} Objeto User completo do banco de dados
   * @throws {UnauthorizedException} Se usuário não encontrado
   *
   * @example
   * ```typescript
   * // Usado internamente pelo JwtStrategy
   * const user = await authService.validateUser({ sub: 'user-id-123' });
   * ```
   */
  async validateUser(payload: any): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  /**
   * @private
   * @method generateTokens
   * @description Gera um par de tokens JWT (access + refresh) para um usuário. O refresh token é
   * persistido no banco de dados com validade de 30 dias.
   *
   * Payload JWT inclui:
   * - sub: user ID
   * - email: email do usuário
   * - userType: PLAYER ou COACH
   * - plan: FREE ou PREMIUM
   *
   * @param {User} user - Objeto User do Prisma
   * @returns {Promise<{access_token: string, refresh_token: string}>} Par de tokens JWT
   */
  private async generateTokens(user: User) {
    try {
      const payload = {
        sub: user.id,
        email: user.email,
        userType: user.userType,
        plan: user.plan,
      };

      console.log('📝 Generating tokens for user:', user.email);

      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      });

      console.log('🔐 Tokens generated, saving to database...');

      // Save refresh token to database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

      await this.prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt,
        },
      });

      console.log('✅ Refresh token saved');

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (error) {
      console.error('❌ Error generating tokens:', error);
      throw error;
    }
  }

  /**
   * @private
   * @method sanitizeUser
   * @description Remove o campo 'password' do objeto User antes de retorná-lo ao cliente.
   * Essencial para segurança: nunca expor hashes de senha na API.
   *
   * @param {User} user - Objeto User do Prisma
   * @returns {Omit<User, 'password'>} User sem o campo password
   */
  private sanitizeUser(user: User) {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}