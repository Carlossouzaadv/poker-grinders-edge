# CLAUDE.md - Mobile (React Native)

Diretrizes específicas para desenvolvimento do app mobile React Native do Poker Grinder's Edge.

## Arquitetura Mobile

### Stack Tecnológico
- **Framework:** React Native + TypeScript
- **Navegação:** React Navigation (Stack + Bottom Tabs)
- **Estado:** Zustand (gerenciamento de estado)
- **Estilização:** NativeWind (Tailwind CSS para React Native)
- **Testes:** Jest + React Native Testing Library

### Estrutura de Pastas
```
mobile/src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (Button, Input, etc)
│   ├── forms/          # Formulários específicos
│   └── charts/         # Gráficos e visualizações
├── screens/            # Telas principais
│   ├── auth/           # Login, Registro
│   ├── bankroll/       # Gestão de bankroll
│   ├── study/          # Laboratório de estudo
│   └── marketplace/    # Coaches marketplace
├── navigation/         # Configuração de rotas
├── store/              # Zustand stores
├── services/           # APIs e integrações
├── hooks/              # Custom hooks
├── utils/              # Funções utilitárias
└── types/              # Tipos TypeScript
```

## Padrões de Desenvolvimento

### Componentes Funcionais
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false
}) => {
  return (
    <TouchableOpacity
      className={`p-4 rounded-lg ${variant === 'primary' ? 'bg-poker-green' : 'bg-gray-600'}`}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className="text-white text-center font-semibold">{title}</Text>
    </TouchableOpacity>
  );
};
```

### Stores Zustand
```typescript
// store/bankrollStore.ts
interface BankrollState {
  sessions: Session[];
  currentBalance: number;
  isLoading: boolean;
  addSession: (session: Session) => void;
  fetchSessions: () => Promise<void>;
}

export const useBankrollStore = create<BankrollState>((set, get) => ({
  sessions: [],
  currentBalance: 0,
  isLoading: false,

  addSession: (session) => set(state => ({
    sessions: [...state.sessions, session],
    currentBalance: state.currentBalance + session.result
  })),

  fetchSessions: async () => {
    set({ isLoading: true });
    try {
      const sessions = await sessionService.getAll();
      set({ sessions, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      // Handle error
    }
  }
}));
```

### Telas (Screens)
```typescript
// screens/bankroll/SessionListScreen.tsx
export const SessionListScreen: React.FC = () => {
  const { sessions, fetchSessions, isLoading } = useBankrollStore();
  const navigation = useNavigation();

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-poker-dark">
      <Header title="Minhas Sessões" />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={sessions}
          renderItem={({ item }) => <SessionCard session={item} />}
          keyExtractor={(item) => item.id}
        />
      )}

      <FloatingActionButton
        icon="plus"
        onPress={() => navigation.navigate('NewSession')}
      />
    </SafeAreaView>
  );
};
```

## Estilização com NativeWind

### Tema de Cores
```typescript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'poker-dark': '#1a1a1a',
        'poker-green': '#4ade80',
        'poker-red': '#ef4444',
        'poker-gold': '#fbbf24',
        'poker-card': '#2d2d2d',
      }
    }
  }
};
```

### Classes Utilitárias
```typescript
// utils/styles.ts
export const commonStyles = {
  container: 'flex-1 bg-poker-dark p-4',
  card: 'bg-poker-card rounded-lg p-4 mb-4',
  title: 'text-white text-xl font-bold mb-2',
  subtitle: 'text-gray-300 text-base mb-4',
  button: 'bg-poker-green p-3 rounded-lg',
  buttonText: 'text-white text-center font-semibold'
};
```

## Navegação

### Configuração Principal
```typescript
// navigation/AppNavigator.tsx
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: { backgroundColor: '#2d2d2d' },
      tabBarActiveTintColor: '#4ade80',
      tabBarInactiveTintColor: '#9ca3af'
    }}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Bankroll" component={BankrollNavigator} />
    <Tab.Screen name="Study" component={StudyNavigator} />
    <Tab.Screen name="Marketplace" component={MarketplaceNavigator} />
  </Tab.Navigator>
);
```

## Comandos Específicos

### Desenvolvimento
```bash
npx react-native run-android    # Android
npx react-native run-ios        # iOS
npx react-native start          # Metro bundler
```

### Testes
```bash
npm run test                     # Testes unitários
npm run test:watch              # Watch mode
```

### Build
```bash
cd android && ./gradlew assembleRelease  # Android APK
npx react-native run-ios --configuration Release  # iOS release
```

## Regras de UX/UI

### Design System
- **Cores:** Tema escuro com verde poker como accent
- **Tipografia:** Inter/System fonts
- **Espaçamento:** Múltiplos de 4px (Tailwind spacing)
- **Border Radius:** 8px padrão, 12px para cards

### Componentes Base Obrigatórios
- `Button` (variants: primary, secondary, danger)
- `Input` (com validação visual)
- `Card` (container padrão)
- `LoadingSpinner`
- `FloatingActionButton`
- `Header` (com navegação)

### Acessibilidade
- Sempre usar `accessibilityLabel`
- Contrastes adequados para texto
- Tamanhos de toque mínimos (44px)

## Integrações de Serviços

### API Service
```typescript
// services/api.ts
class ApiService {
  private baseURL = 'http://localhost:3000/api';

  async get(endpoint: string) {
    const token = await AsyncStorage.getItem('token');
    return fetch(`${this.baseURL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
```

### Persistência Local
```typescript
// services/storage.ts
export const storage = {
  setItem: (key: string, value: any) =>
    AsyncStorage.setItem(key, JSON.stringify(value)),

  getItem: async (key: string) => {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }
};
```

## Testes

### Testes de Componentes
```typescript
describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button title="Test" onPress={jest.fn()} />);
    expect(screen.getByText('Test')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockPress = jest.fn();
    render(<Button title="Test" onPress={mockPress} />);

    fireEvent.press(screen.getByText('Test'));
    expect(mockPress).toHaveBeenCalled();
  });
});
```

## Diretrizes para Claude

1. **Sempre usar TypeScript** com tipagem completa
2. **Seguir padrões NativeWind** para estilização
3. **Criar componentes reutilizáveis** antes de usar
4. **Testar componentes críticos** com Testing Library
5. **Manter consistência** com design system
6. **Otimizar performance** com useMemo/useCallback quando necessário
7. **Usar Zustand** para estado compartilhado entre telas