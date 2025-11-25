import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);

    // Simular envio - em produção, integrar com serviço de email marketing
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('Lead capturado:', { name, email });
    setSubmitted(true);
    setIsSubmitting(false);

    // Fechar modal após 2 segundos
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setEmail('');
      setName('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 transform transition-all">

        {!submitted ? (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4 leading-tight">
                {t('leadCapture.title')}
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                {t('leadCapture.subtitle')} <span className="font-bold text-purple-600">PokerMastery</span> completo.
                <br />
                <span className="text-green-600 font-semibold">{t('leadCapture.description')}</span>
              </p>
            </div>

            {/* Features teaser com ícones e benefícios claros */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center text-sm text-gray-700">
                <span className="text-green-500 mr-3 text-lg">✅</span>
                <span className="font-medium">{t('leadCapture.features.bankroll')}</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <span className="text-purple-500 mr-3 text-lg">🧠</span>
                <span className="font-medium">{t('leadCapture.features.gto')}</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <span className="text-blue-500 mr-3 text-lg">🔬</span>
                <span className="font-medium">{t('leadCapture.features.lab')}</span>
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <span className="text-orange-500 mr-3 text-lg">🤝</span>
                <span className="font-medium">{t('leadCapture.features.coaches')}</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder={t('leadCapture.form.namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <input
                  type="email"
                  placeholder={t('leadCapture.form.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={!email || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:via-blue-700 hover:to-purple-800 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                >
                  {isSubmitting ? t('leadCapture.form.submittingButton') : t('leadCapture.form.submitButton')}
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full text-gray-500 hover:text-gray-700 transition-colors text-sm"
              >
                {t('leadCapture.form.laterButton')}
              </button>
            </form>

            {/* Trust signals */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                {t('leadCapture.trust')}
              </p>
            </div>
          </>
        ) : (
          /* Success state */
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">
              {t('leadCapture.success.title')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('leadCapture.success.message')}
            </p>
            <div className="text-sm text-gray-500">
              {t('leadCapture.success.closing')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadCaptureModal;