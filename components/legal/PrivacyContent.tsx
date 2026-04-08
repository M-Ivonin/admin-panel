import type { Locale } from '@/lib/i18n/config';

type PrivacyContentProps = {
  locale?: Locale;
};

export function PrivacyContent({ locale = 'en' }: PrivacyContentProps) {
  if (locale === 'pt') {
    return (
      <div className="space-y-6 text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_p]:mb-4">
        <p className="text-secondary">
          Ao instalar, acessar ou utilizar o SirBro, você declara que leu, compreendeu e concorda com todos os termos, políticas e condições descritos neste documento.
        </p>
        <p>
          Esta Política de Privacidade explica como a Levantem AI LTD (&quot;nós&quot;, &quot;nosso&quot;, &quot;nossa&quot;) coleta, usa e protege suas informações ao utilizar o aplicativo móvel SirBro e seus serviços relacionados (coletivamente, o &quot;Serviço&quot;).
        </p>
        <p>Ao usar o SirBro, você concorda com esta Política de Privacidade. Caso não concorde, não utilize o aplicativo.</p>

        <h2>1. Quem Somos</h2>
        <p><strong>Levantem AI LTD</strong></p>
        <p>Endereço: Gladstonos, 116, M. Kyprianou House, 3º e 4º andar, 3032, Limassol, Chipre</p>
        <p>E-mail para questões legais e de privacidade: legal@levantemai.pro</p>
        <p>E-mail para suporte: support@levantemai.pro</p>
        <p>A Levantem AI LTD é a controladora dos dados pessoais tratados pelo SirBro, de acordo com a Lei Geral de Proteção de Dados (LGPD - Brasil), o Regulamento Geral de Proteção de Dados (GDPR - União Europeia) e legislações semelhantes na América Latina.</p>

        <h2>2. Dados que Coletamos</h2>
        <p>Podemos coletar as seguintes informações quando você usa o SirBro:</p>

        <h3>a. Dados de Conta</h3>
        <ul>
          <li>Nome</li>
          <li>Endereço de e-mail</li>
        </ul>
        <p>Usados para criar e gerenciar sua conta, autenticar login e enviar comunicações essenciais.</p>

        <h3>b. Localização</h3>
        <p>Localização aproximada (país ou região), derivada das configurações do dispositivo ou IP.</p>
        <p>Usada para exibir conteúdo esportivo e estatísticas relevantes à sua região.</p>

        <h3>c. Informações de Uso</h3>
        <p>Interações no app, tempo de sessão, recursos utilizados, tipo de dispositivo e versão do aplicativo.</p>
        <p>Usadas para entender o desempenho do app e melhorar a experiência do usuário.</p>

        <h3>d. Interações com IA</h3>
        <p>Perguntas, textos ou mensagens enviados aos sistemas de inteligência artificial do SirBro.</p>
        <p>Usados para gerar respostas e aprimorar a qualidade do serviço.</p>

        <h3>e. Número de Telefone (Opcional)</h3>
        <p>Permitir que outros usuários que já possuem seu número em seus contatos possam encontrá-lo e se conectar com você dentro do aplicativo.</p>
        <p>Habilitar funcionalidades de descoberta baseadas em contatos.</p>
        <p>Seu número de telefone não é visível publicamente e é utilizado apenas para correspondência segura entre contatos existentes.</p>

        <h2>3. Como Usamos Seus Dados</h2>
        <p>Seus dados são utilizados para:</p>
        <ol>
          <li>Operar e manter o aplicativo;</li>
          <li>Personalizar o conteúdo e os resultados gerados por IA;</li>
          <li>Permitir a comunicação entre usuários nos chats da comunidade;</li>
          <li>Responder dúvidas e oferecer suporte;</li>
          <li>Detectar e prevenir fraudes ou uso indevido;</li>
          <li>Melhorar desempenho, design e segurança do app;</li>
          <li>Cumprir obrigações legais.</li>
        </ol>
        <p>Seu número de telefone não é visível publicamente e é utilizado apenas para correspondência segura entre contatos existentes.</p>
        <p>Não vendemos nem compartilhamos seus dados pessoais com terceiros para fins de marketing.</p>

        <h2>4. Base Legal para o Tratamento de Dados</h2>
        <p>Tratamos seus dados com base em:</p>
        <ul>
          <li>Consentimento, quando você cria uma conta ou aceita esta Política;</li>
          <li>Execução de contrato, para permitir o funcionamento do Serviço;</li>
          <li>Interesse legítimo, para manter a segurança, prevenir abusos e melhorar o produto;</li>
          <li>Obrigação legal, quando o fornecimento é exigido por autoridades competentes;</li>
          <li>Consentimento, incluindo para dados opcionais como número de telefone e funcionalidades de descoberta baseadas em contatos.</li>
        </ul>

        <h2>5. Retenção de Dados</h2>
        <p>Mantemos seus dados apenas pelo tempo necessário para as finalidades descritas:</p>
        <ul>
          <li>Dados de conta: enquanto a conta estiver ativa ou até solicitação de exclusão;</li>
          <li>Dados de uso: até 24 meses;</li>
          <li>Registros legais: conforme exigido pela legislação aplicável.</li>
        </ul>
        <p>Após esse período, os dados são anonimizados ou excluídos com segurança.</p>

        <h2>6. Compartilhamento e Transferência de Dados</h2>
        <p>Podemos compartilhar dados limitados com:</p>
        <ul>
          <li>Prestadores de serviço que auxiliam na hospedagem, operação e segurança do aplicativo;</li>
          <li>Sistemas de IA de terceiros utilizados para gerar previsões e respostas;</li>
          <li>Autoridades legais, quando houver obrigação jurídica.</li>
        </ul>
        <p>Como operamos a partir de Chipre, seus dados podem ser transferidos para outros países, inclusive fora da União Europeia ou do Brasil.</p>
        <p>Garantimos que tais transferências sigam cláusulas contratuais padrão e medidas de segurança adequadas.</p>

        <h2>7. Segurança dos Dados</h2>
        <p>Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, perda ou uso indevido, incluindo criptografia e controles de acesso.</p>
        <p>No entanto, nenhum sistema é totalmente seguro.</p>
        <p>Você utiliza o SirBro por sua própria conta e risco.</p>

        <h2>8. Seus Direitos</h2>
        <p>De acordo com a LGPD, o GDPR e legislações equivalentes, você tem direito a:</p>
        <ul>
          <li>Acessar seus dados;</li>
          <li>Corrigir ou atualizar informações incorretas;</li>
          <li>Solicitar exclusão ou anonimização;</li>
          <li>Retirar consentimento;</li>
          <li>Opor-se ao tratamento;</li>
          <li>Solicitar portabilidade dos dados.</li>
        </ul>
        <p>Você pode adicionar ou remover seu número de telefone a qualquer momento nas configurações do aplicativo, bem como desativar funcionalidades de descoberta baseadas em contatos.</p>
        <p>Para exercer seus direitos, entre em contato via legal@levantemai.pro.</p>
        <p>Podemos solicitar comprovação de identidade antes de processar sua solicitação.</p>

        <h2>9. Privacidade de Menores</h2>
        <p>O SirBro é destinado apenas a maiores de 18 anos.</p>
        <p>Não coletamos intencionalmente dados de menores.</p>
        <p>Caso identifique uso indevido por um menor, avise-nos imediatamente para exclusão dos dados.</p>

        <h2>10. Alterações nesta Política</h2>
        <p>Podemos atualizar esta Política de Privacidade periodicamente.</p>
        <p>A nova versão será publicada no aplicativo ou em link indicado.</p>
        <p>O uso contínuo do SirBro após atualizações significa que você aceita as mudanças.</p>

        <h2>11. Contato</h2>
        <p>Questões sobre privacidade e dados: legal@levantemai.pro</p>
        <p>Suporte ao usuário: support@levantemai.pro</p>

        <p className="mt-8 text-secondary">© 2026 Levantem AI LTD. Todos os direitos reservados.</p>
      </div>
    );
  }

  if (locale === 'es') {
    return (
      <div className="space-y-6 text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_p]:mb-4">
        <p className="text-secondary">
          Al instalar, acceder o utilizar SirBro, confirmas que has leído, comprendido y aceptas todos los términos, políticas y condiciones descritos en este documento.
        </p>
        <p>
          Esta Política de Privacidad explica cómo Levantem AI LTD (&quot;nosotros&quot;, &quot;nuestro&quot;, &quot;nuestra&quot;) recopila, utiliza y protege tu información cuando utilizas la aplicación móvil SirBro y sus servicios relacionados (en conjunto, el &quot;Servicio&quot;).
        </p>
        <p>Al usar SirBro, aceptas esta Política de Privacidad. Si no estás de acuerdo, no utilices la aplicación.</p>

        <h2>1. Quiénes Somos</h2>
        <p><strong>Levantem AI LTD</strong></p>
        <p>Dirección: Gladstonos, 116, M. Kyprianou House, 3º y 4º piso, 3032, Limassol, Chipre</p>
        <p>Correo para asuntos legales y privacidad: legal@levantemai.pro</p>
        <p>Correo de soporte: support@levantemai.pro</p>
        <p>Levantem AI LTD es el responsable del tratamiento de datos personales bajo las leyes aplicables, incluyendo el Reglamento General de Protección de Datos (GDPR - Unión Europea) y la Ley General de Protección de Datos Personales (LGPD - Brasil).</p>

        <h2>2. Datos que Recopilamos</h2>
        <p>Podemos recopilar la siguiente información al utilizar SirBro:</p>

        <h3>a. Datos de Cuenta</h3>
        <ul>
          <li>Nombre</li>
          <li>Dirección de correo electrónico</li>
        </ul>
        <p>Usados para crear y administrar tu cuenta, autenticar tu acceso y enviarte notificaciones esenciales.</p>

        <h3>b. Ubicación</h3>
        <p>Ubicación aproximada (país o región), derivada de la configuración del dispositivo o la dirección IP.</p>
        <p>Usada para mostrar contenido y estadísticas relevantes según tu región.</p>

        <h3>c. Datos de Uso</h3>
        <p>Interacciones dentro de la app, duración de sesiones, funciones utilizadas, tipo de dispositivo y versión de la aplicación.</p>
        <p>Usados para mejorar el rendimiento y la experiencia del usuario.</p>

        <h3>d. Interacciones con la IA</h3>
        <p>Preguntas, textos o mensajes que envíes a los sistemas de inteligencia artificial de SirBro.</p>
        <p>Usados para generar respuestas y optimizar la calidad del servicio.</p>

        <h3>e. Número de Teléfono (Opcional)</h3>
        <p>Permitir que otros usuarios que ya tienen tu número en sus contactos puedan encontrarte y conectar contigo dentro de la aplicación.</p>
        <p>Habilitar funciones de descubrimiento basadas en contactos.</p>
        <p>Tu número de teléfono no es visible públicamente y solo se utiliza para coincidencias seguras entre contactos existentes.</p>

        <h2>3. Cómo Utilizamos tus Datos</h2>
        <p>Utilizamos tus datos personales para:</p>
        <ol>
          <li>Operar y mantener el Servicio;</li>
          <li>Personalizar el contenido y las predicciones generadas por IA;</li>
          <li>Permitir la comunicación entre usuarios en los chats comunitarios;</li>
          <li>Brindar soporte y responder consultas;</li>
          <li>Detectar y prevenir fraudes o uso indebido;</li>
          <li>Mejorar la seguridad y el funcionamiento de la aplicación;</li>
          <li>Cumplir con obligaciones legales o regulatorias.</li>
          <li>Permitir el descubrimiento basado en contactos mediante la coincidencia de tu número de teléfono con otros usuarios que ya lo tengan en sus contactos.</li>
        </ol>
        <p>No vendemos tus datos personales. Tampoco compartimos tus datos personales con terceros para sus propios fines publicitarios.</p>

        <h2>4. Base Legal para el Tratamiento</h2>
        <p>Tratamos tus datos sobre las siguientes bases jurídicas:</p>
        <ul>
          <li>Consentimiento, cuando aceptas esta Política o creas una cuenta;</li>
          <li>Ejecución de contrato, para operar el Servicio que solicitas;</li>
          <li>Interés legítimo, para mantener la seguridad y mejorar el producto;</li>
          <li>Cumplimiento legal, cuando la ley nos lo exige;</li>
          <li>Consentimiento, incluyendo para datos opcionales como el número de teléfono y funciones de descubrimiento basadas en contactos.</li>
        </ul>

        <h2>5. Conservación de los Datos</h2>
        <p>Conservamos tus datos solo durante el tiempo necesario para los fines mencionados:</p>
        <ul>
          <li>Datos de cuenta: mientras la cuenta esté activa o hasta que solicites su eliminación;</li>
          <li>Datos de uso: hasta 24 meses;</li>
          <li>Registros legales: según lo requiera la ley.</li>
        </ul>
        <p>Luego, los datos se eliminan o se anonimizan de forma segura.</p>

        <h2>6. Compartición y Transferencias Internacionales</h2>
        <p>Podemos compartir información con:</p>
        <ul>
          <li>Proveedores de servicios que nos ayudan con la operación, alojamiento o seguridad del Servicio;</li>
          <li>Sistemas de IA de terceros, utilizados para generar respuestas o análisis;</li>
          <li>Autoridades legales, cuando la ley lo requiera.</li>
        </ul>
        <p>Dado que operamos desde Chipre, tus datos pueden transferirse fuera del Espacio Económico Europeo o de tu país.</p>
        <p>Estas transferencias están protegidas mediante cláusulas contractuales estándar u otras medidas equivalentes.</p>

        <h2>7. Seguridad de los Datos</h2>
        <p>Aplicamos medidas técnicas y organizativas apropiadas para proteger tu información contra acceso no autorizado, pérdida o mal uso, como cifrado y controles de acceso.</p>
        <p>Sin embargo, ningún sistema es completamente seguro, y utilizas SirBro bajo tu propio riesgo.</p>

        <h2>8. Tus Derechos</h2>
        <p>Según la legislación de protección de datos aplicable, puedes:</p>
        <ul>
          <li>Acceder a tus datos personales;</li>
          <li>Solicitar su corrección o eliminación;</li>
          <li>Retirar tu consentimiento;</li>
          <li>Oponerte al tratamiento o solicitar su limitación;</li>
          <li>Solicitar la portabilidad de tus datos;</li>
          <li>Añadir o eliminar tu número de teléfono en cualquier momento desde la configuración de la aplicación;</li>
          <li>Desactivar las funciones de descubrimiento basadas en contactos.</li>
        </ul>
        <p>Para ejercer estos derechos, comunícate a legal@levantemai.pro.</p>
        <p>Podemos requerir verificación de identidad antes de procesar tu solicitud.</p>

        <h2>9. Privacidad de Menores</h2>
        <p>SirBro está destinado únicamente a mayores de 18 años.</p>
        <p>No recopilamos intencionadamente información de menores.</p>
        <p>Si crees que un menor nos ha proporcionado datos, contáctanos para eliminarlos de inmediato.</p>

        <h2>10. Cambios en esta Política</h2>
        <p>Podremos actualizar esta Política de Privacidad periódicamente.</p>
        <p>Publicaremos la versión actualizada en el aplicativo o mediante un enlace visible.</p>
        <p>El uso continuo de SirBro después de cualquier actualización implica tu aceptación de la nueva versión.</p>

        <h2>11. Contacto</h2>
        <p>Asuntos de privacidad y proteccion de datos: legal@levantemai.pro</p>
        <p>Soporte al usuario: support@levantemai.pro</p>

        <p className="mt-8 text-secondary">© 2026 Levantem AI LTD. Todos los derechos reservados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_p]:mb-4">
      <p className="text-secondary">
        By installing, accessing, or using SirBro, you confirm that you have read, understood, and agreed to all the terms, policies, and conditions described in this document.
      </p>
      <p>
        This Privacy Policy explains how Levantem AI LTD (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) collects, uses, and protects your information when you use the SirBro mobile application and related services (collectively, the &quot;Service&quot;).
      </p>
      <p>By using SirBro, you agree to this Privacy Policy. If you do not agree, please do not use the Service.</p>

      <h2>1. Who We Are</h2>
      <p><strong>Levantem AI LTD</strong></p>
      <p>Registered in Cyprus</p>
      <p>Address: Gladstonos, 116, M.Kyprianou House, 3&4th floor, 3032, Limassol, Cyprus</p>
      <p>Contact (legal/data requests): legal@levantemai.pro</p>
      <p>Contact (support): support@levantemai.pro</p>
      <p>We are the controller of your personal data under applicable data protection laws, including the EU General Data Protection Regulation (GDPR) and Brazil&apos;s General Data Protection Law (LGPD).</p>

      <h2>2. Data We Collect</h2>
      <h3>a. Account Information</h3>
      <ul>
        <li>Name</li>
        <li>Email address</li>
      </ul>
      <p>Used to create and manage your account, verify identity, and communicate essential updates.</p>

      <h3>b. Location Data</h3>
      <p>Approximate location (country/region), derived from device settings or IP.</p>
      <p>Used to display regionally relevant football data and predictions.</p>

      <h3>c. Usage Information</h3>
      <p>App interactions, session duration, features used, device type, and app version.</p>
      <p>Used to understand app performance and improve user experience.</p>

      <h3>d. AI Interaction Data</h3>
      <p>Text inputs or questions you submit to SirBro&apos;s AI systems.</p>
      <p>Used to generate responses and improve service quality.</p>

      <h3>e. Phone Number (Optional)</h3>
      <p>Help other users who already have your number in their contacts find and connect with you.</p>
      <p>Enable contact-based discovery features within the app.</p>
      <p>Your phone number is not publicly visible and is only used for secure matching purposes.</p>

      <h2>3. How We Use Your Data</h2>
      <p>We use your information to:</p>
      <ol>
        <li>Operate and maintain the Service;</li>
        <li>Personalize app content and AI-generated insights;</li>
        <li>Enable communication between users via in-app chat;</li>
        <li>Respond to inquiries and provide support;</li>
        <li>Detect and prevent misuse or fraudulent activity;</li>
        <li>Improve user experience and functionality;</li>
        <li>Comply with legal obligations.</li>
        <li>Enable contact-based discovery by matching your phone number with other users who already have it in their contacts.</li>
      </ol>
      <p>We do not sell your personal data. We do not share your personal data with third parties for their own marketing purposes.</p>

      <h2>4. Legal Basis for Processing (GDPR / LGPD)</h2>
      <p>We process your data based on:</p>
      <ul>
        <li>Consent — when you create an account or agree to this Policy;</li>
        <li>Contract necessity — to provide and operate the Service;</li>
        <li>Legitimate interest — to maintain security, prevent misuse, and improve functionality;</li>
        <li>Legal obligation — when required by law or authority;</li>
        <li>Consent — for optional data such as phone number and any contact-based discovery features.</li>
      </ul>

      <h2>5. Data Retention</h2>
      <p>We retain your personal data only as long as necessary for the purposes described above:</p>
      <ul>
        <li>Account data — while your account is active or until deletion request;</li>
        <li>Usage logs — up to 24 months;</li>
        <li>Legal records — as required by applicable law.</li>
      </ul>
      <p>Once no longer needed, data is securely deleted or anonymized.</p>

      <h2>6. Data Sharing and Transfers</h2>
      <p>We may share limited data with:</p>
      <ul>
        <li>Service providers assisting in app operations, hosting, or security;</li>
        <li>AI processing providers (third-party systems generating insights);</li>
        <li>Legal authorities, when required by law.</li>
      </ul>
      <p>Because our operations are managed from Cyprus, your data may be transferred to other countries, including outside the EEA or Brazil.</p>
      <p>We ensure such transfers are protected by standard contractual clauses and equivalent safeguards.</p>

      <h2>7. Data Security</h2>
      <p>We implement appropriate technical and organizational measures to protect your data from loss, misuse, or unauthorized access — including encryption, access controls, and secure storage systems.</p>
      <p>However, no system is 100% secure, and you use SirBro at your own risk.</p>

      <h2>8. Your Rights</h2>
      <p>Depending on your jurisdiction, you have the right to:</p>
      <ul>
        <li>Access and obtain a copy of your data;</li>
        <li>Request correction or deletion;</li>
        <li>Withdraw consent;</li>
        <li>Object to or restrict processing;</li>
        <li>Request data portability;</li>
        <li>Add or remove your phone number at any time in app settings;</li>
        <li>Disable contact-based discovery features at any time.</li>
      </ul>
      <p>To exercise these rights, contact legal@levantemai.pro.</p>
      <p>We may verify your identity before processing your request.</p>

      <h2>9. Children&apos;s Privacy</h2>
      <p>SirBro is intended only for users aged 18 and older.</p>
      <p>We do not knowingly collect or process data from minors.</p>
      <p>If you believe a minor has provided us information, please contact legal@levantemai.pro for prompt deletion.</p>

      <h2>10. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time.</p>
      <p>Updates will be posted within the app or at our designated link.</p>
      <p>Continued use of SirBro after an update means you accept the revised version.</p>

      <h2>11. Contact Us</h2>
      <p>For data protection or privacy matters: legal@levantemai.pro</p>
      <p>For user or technical support: support@levantemai.pro</p>

      <p className="mt-8 text-secondary">© 2026 Levantem AI LTD. All rights reserved.</p>
    </div>
  );
}
