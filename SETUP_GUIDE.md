# 🛠️ Guia de Configuração do Ambiente React Native

Este guia irá configurar seu ambiente Windows para desenvolvimento React Native com Android.

## ✅ Situação Atual
- [x] Node.js instalado
- [x] npm instalado
- [x] Projeto React Native criado
- [x] Android Studio instalado
- [x] Android SDK configurado
- [x] Variáveis de ambiente configuradas
- [x] Emulador Android criado (Medium_Phone_API_36.1)
- [❌] **Java JDK 17-20** (atual: **Java 25** - incompatível!)

## 🚨 **PRÓXIMO PASSO OBRIGATÓRIO**

**Java 25 não é compatível com React Native!** É necessário fazer downgrade para JDK 17.

### ➡️ AÇÃO NECESSÁRIA: Instalar Java JDK 17

1. **Baixar JDK 17**: https://adoptium.net/temurin/releases/
   - Selecione **OpenJDK 17 LTS**
   - Windows x64 MSI

2. **Durante a instalação**:
   - ✅ Marque "Set JAVA_HOME variable"
   - ✅ Marque "JavaSoft (Oracle) registry keys"

3. **Após instalação**:
   - Reiniciar terminal
   - Verificar: `java -version` (deve mostrar 17.x.x)

4. **Se JAVA_HOME não foi configurado automaticamente**:
   - Painel de Controle → Sistema → Variáveis de Ambiente
   - JAVA_HOME = `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot`

## 🔧 Passos para Configuração

### 1. Instalar Java JDK 17

**Opção A: Download Direto (Recomendado)**
1. Acesse: https://adoptium.net/temurin/releases/
2. Baixe o **JDK 17** para Windows x64
3. Execute o instalador e siga as instruções
4. ✅ **IMPORTANTE**: Marque a opção "Set JAVA_HOME variable"

**Opção B: Via Winget (se funcionar)**
```bash
winget install Eclipse.Temurin.17.JDK
```

### 2. Instalar Android Studio

1. **Download**: https://developer.android.com/studio
2. **Instalação**: Execute o instalador
3. **Setup Wizard**:
   - Escolha "Standard" installation
   - Aceite as licenças
   - Aguarde o download do Android SDK

### 3. Configurar Android SDK

No Android Studio:
1. **File** → **Settings** (ou **Ctrl+Alt+S**)
2. **Appearance & Behavior** → **System Settings** → **Android SDK**
3. **SDK Platforms**: Instale **Android 14 (API Level 34)**
4. **SDK Tools**: Certifique-se que estão instalados:
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
   - Android SDK Tools
   - Intel x86 Emulator Accelerator (HAXM installer)

### 4. Configurar Variáveis de Ambiente

**Adicione estas variáveis no Sistema:**

1. **Abra**: Painel de Controle → Sistema → Configurações Avançadas → Variáveis de Ambiente

2. **Adicione (Variáveis do Sistema):**
   ```
   ANDROID_HOME = C:\Users\%USERNAME%\AppData\Local\Android\Sdk
   JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot
   ```

3. **Edite PATH** (adicione estas linhas):
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   %JAVA_HOME%\bin
   ```

### 5. Criar Emulador Android

1. **Android Studio** → **Tools** → **AVD Manager**
2. **Create Virtual Device**
3. **Escolha**: Pixel 4 ou similar
4. **System Image**: Android 14 (API Level 34)
5. **Finish**

### 6. Verificar Configuração

Reinicie o terminal e execute:

```bash
# Verificar Java
java -version
# Deve mostrar: openjdk version "17.x.x"

# Verificar Android SDK
adb version
# Deve mostrar: Android Debug Bridge version

# Verificar React Native
cd mobile
npx react-native doctor
# Deve mostrar todos os ✓ verdes
```

### 7. Executar o App

```bash
# Inicie o emulador primeiro
# No Android Studio: AVD Manager → Play button

# Execute o app
cd mobile
npx react-native run-android
```

## 🚨 Problemas Comuns

### "adb não é reconhecido"
- Verifique se `%ANDROID_HOME%\platform-tools` está no PATH
- Reinicie o terminal

### "No Java compiler found"
- Verifique se JAVA_HOME aponta para JDK 17+ (não JRE)
- Reinicie o terminal

### "No emulators found"
- Crie um emulador no AVD Manager
- Inicie o emulador antes de rodar o app

### Build failed
- Execute: `cd android && ./gradlew clean && cd ..`
- Tente novamente: `npx react-native run-android`

## 📞 Suporte

Se encontrar problemas:
1. Execute `npx react-native doctor`
2. Verifique se todas as variáveis de ambiente estão corretas
3. Reinicie o terminal/computador após mudanças nas variáveis

---

**⏱️ Tempo estimado de configuração: 30-60 minutos**