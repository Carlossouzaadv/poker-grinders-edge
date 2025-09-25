import React, { useState } from 'react';

interface ChipStackProps {
  valor: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const ChipStack: React.FC<ChipStackProps> = ({
  valor,
  size = 'medium',
  showLabel = true
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const formatarValor = (valor: number): string => {
    if (valor >= 1000) {
      return `${(valor / 1000).toFixed(1)}K`;
    }
    return valor.toString();
  };

  // Função para determinar qual ficha usar baseado no valor
  const getChipClass = (valor: number): string => {
    if (valor >= 10000) return 'chip-10000';
    if (valor >= 5000) return 'chip-5000';
    if (valor >= 1000) return 'chip-1000';
    if (valor >= 500) return 'chip-500';
    if (valor >= 100) return 'chip-100';
    if (valor >= 50) return 'chip-50';
    if (valor >= 25) return 'chip-25';
    if (valor >= 10) return 'chip-10';
    if (valor >= 5) return 'chip-5';
    return 'chip-1';
  };

  // Função para pegar a cor de fallback baseada no valor
  const getFallbackColor = (valor: number): string => {
    if (valor >= 10000) return '#00BFFF'; // Azul Claro
    if (valor >= 5000) return '#FF1493';  // Rosa
    if (valor >= 1000) return '#FFD700';  // Amarela
    if (valor >= 500) return '#8A2BE2';   // Roxa
    if (valor >= 100) return '#000000';   // Preta
    if (valor >= 50) return '#483D8B';    // Azul Escuro
    if (valor >= 25) return '#228B22';    // Verde
    if (valor >= 10) return '#0000FF';    // Azul
    if (valor >= 5) return '#FF0000';     // Vermelha
    return '#FFFFFF'; // Branca
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return { width: '30px', height: '30px', fontSize: '10px' };
      case 'large':
        return { width: '60px', height: '60px', fontSize: '14px' };
      default:
        return { width: '45px', height: '45px', fontSize: '12px' };
    }
  };

  const chipClass = getChipClass(valor);
  const sizeStyles = getSizeClasses();

  return (
    <>
      {/* CSS para o sprite de fichas */}
      <style jsx>{`
        .chip-sprite {
          background-image: url('/assets/images/poker chips.png');
          background-repeat: no-repeat;
        }

        /* Linha 1 (Topo) - 2x5 grid */
        .chip-1 { background-position: 0% 0%; }         /* Posição 1: Branca */
        .chip-5 { background-position: 25% 0%; }        /* Posição 2: Vermelha */
        .chip-10 { background-position: 50% 0%; }       /* Posição 3: Azul */
        .chip-25 { background-position: 75% 0%; }       /* Posição 4: Verde */
        .chip-50 { background-position: 100% 0%; }      /* Posição 5: Azul Escuro */

        /* Linha 2 (Embaixo) */
        .chip-100 { background-position: 0% 100%; }     /* Posição 1: Preta */
        .chip-500 { background-position: 25% 100%; }    /* Posição 2: Roxa */
        .chip-1000 { background-position: 50% 100%; }   /* Posição 3: Amarela */
        .chip-5000 { background-position: 75% 100%; }   /* Posição 4: Rosa */
        .chip-10000 { background-position: 100% 100%; } /* Posição 5: Azul Claro */

        .chip-sprite {
          background-size: 500% 200%; /* 5 colunas, 2 linhas */
        }
      `}</style>

      <div className="relative flex flex-col items-center">
        {/* Chip com sprite principal e fallback seguro */}
        <div
          className={`cursor-pointer transition-transform hover:scale-110 rounded-full ${
            !imageFailed ? `chip-sprite ${chipClass}` : ''
          }`}
          style={{
            ...sizeStyles,
            width: sizeStyles.width,
            height: sizeStyles.height,
            backgroundColor: imageFailed ? getFallbackColor(valor) : 'transparent',
            border: imageFailed ? '2px solid #FFF' : 'none',
            boxShadow: imageFailed ? 'inset 0 2px 4px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.4)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: imageFailed ? (valor >= 100 && valor < 500 ? '#FFF' : '#000') : 'transparent'
          }}
          title={`Ficha de $${valor}`}
        >
          {/* Imagem sprite com detecção de erro */}
          {!imageFailed && (
            <img
              src="/assets/images/poker chips.png"
              alt=""
              style={{ display: 'none' }}
              onError={() => setImageFailed(true)}
              onLoad={() => setImageFailed(false)}
            />
          )}

          {/* Valor exibido quando usando fallback */}
          {imageFailed && (
            <span
              style={{
                fontSize: size === 'small' ? '8px' : size === 'large' ? '12px' : '10px',
                fontWeight: 'bold',
                textShadow: '1px 1px 1px rgba(0,0,0,0.7)'
              }}
            >
              ${valor >= 1000 ? `${(valor/1000).toFixed(0)}k` : valor}
            </span>
          )}
        </div>

        {/* Label do valor */}
        {showLabel && (
          <div
            className="mt-1 px-2 py-0.5 bg-black/90 text-white font-bold rounded-full shadow-lg border border-gray-500"
            style={{
              fontSize: sizeStyles.fontSize,
              minWidth: size === 'small' ? '25px' : '35px',
              textAlign: 'center',
              lineHeight: '1.2'
            }}
          >
            ${formatarValor(valor)}
          </div>
        )}
      </div>
    </>
  );
};

export default ChipStack;