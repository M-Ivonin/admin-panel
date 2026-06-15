import type { Locale } from '@/lib/i18n/config';

type PrivacyContentProps = {
  locale?: Locale;
};

export function PrivacyContent({ locale = 'en' }: PrivacyContentProps) {
  if (locale === 'pt') {
    return (
      <div className="space-y-6 text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_p]:mb-4">
        <p>
          Esta Política de Privacidade explica como a Levantem AI LTD (&quot;nós&quot;, &quot;nosso&quot;, &quot;nossa&quot;) coleta, usa e protege suas informações quando você usa o aplicativo móvel SirBro e os serviços relacionados (coletivamente, o &quot;Serviço&quot;).
        </p>
        <p>Ao usar o SirBro, você concorda com esta Política de Privacidade. Se não concordar, por favor, não use o Serviço.</p>

        <h2>1. Quem Somos</h2>
        <p><strong>Levantem AI LTD</strong></p>
        <p>Registrada em Chipre</p>
        <p>Endereço: Gladstonos, 116, M.Kyprianou House, 3&amp;4th floor, 3032, Limassol, Chipre</p>
        <p>Contato (solicitações legais/de dados): legal@levantemai.pro</p>
        <p>Contato (suporte): support@levantemai.pro</p>
        <p>Somos o controlador dos seus dados pessoais de acordo com as leis de proteção de dados aplicáveis, incluindo o Regulamento Geral de Proteção de Dados (GDPR) da UE e a Lei Geral de Proteção de Dados (LGPD) do Brasil.</p>

        <h2>2. Dados que Coletamos</h2>

        <h3>a. Informações da Conta</h3>
        <ul>
          <li>Nome</li>
          <li>Endereço de e-mail</li>
        </ul>
        <p>Utilizados para criar e gerenciar sua conta, verificar identidade e comunicar atualizações essenciais.</p>

        <h3>b. Dados de Localização</h3>
        <p>Localização aproximada (país/região), derivada das configurações do dispositivo ou IP.</p>
        <p>Utilizados para exibir dados de futebol e previsões relevantes para a região.</p>

        <h3>c. Informações de Uso</h3>
        <p>Interações no aplicativo, duração da sessão, recursos utilizados, tipo de dispositivo e versão do aplicativo.</p>
        <p>Utilizados para entender o desempenho do aplicativo e melhorar a experiência do usuário.</p>

        <h3>d. Dados de Interação com IA</h3>
        <p>Entradas de texto ou perguntas que você envia aos sistemas de IA do SirBro.</p>
        <p>Utilizados para gerar respostas e melhorar a qualidade do serviço.</p>

        <h3>e. Número de Telefone (Opcional)</h3>
        <p>Ajudar outros usuários que já têm seu número em seus contatos a encontrá-lo e conectar-se a você.</p>
        <p>Habilitar recursos de descoberta baseada em contatos dentro do aplicativo.</p>
        <p>Seu número de telefone não é publicamente visível e é usado apenas para fins de correspondência segura.</p>

        <h3>f. Dados da Economia Virtual</h3>
        <p>Seu saldo virtual de Bro Points (BP), inventário de Cartas de Gamificação, status de assinatura e seu histórico de &quot;Picks&quot; e previsões ativas e fechadas.</p>
        <p>Utilizados para gerenciar sua progressão no aplicativo, classificação e portfólio virtual.</p>

        <h3>g. Dados de Interação de Alta Frequência</h3>
        <p>Dados de interação em tempo real durante eventos esportivos ao vivo, incluindo tempo de tela, toques de botão, durações de sessão e métricas de engajamento na partida ao vivo.</p>
        <p>Utilizados para facilitar as mecânicas de previsão ao vivo, otimizar a latência do feed de dados, calcular algoritmos de mercado gamificados e evitar abusos na plataforma ou explorações técnicas.</p>

        <h2>3. Como Usamos Seus Dados</h2>
        <p>Nós usamos suas informações para:</p>
        <ol>
          <li>Operar e manter o Serviço;</li>
          <li>Processar suas previsões esportivas, gerenciar seus Bro Points virtuais (BP) e resolver resultados gamificados;</li>
          <li>Personalizar o conteúdo do aplicativo e os insights gerados por IA;</li>
          <li>Possibilitar a comunicação entre usuários via chat no aplicativo;</li>
          <li>Monitorar a integridade de nossas conexões WebSocket em tempo real durante eventos esportivos ao vivo;</li>
          <li>Responder a dúvidas e fornecer suporte;</li>
          <li>Detectar e prevenir uso indevido, atividades fraudulentas ou abuso de rede (incluindo arbitragem de latência);</li>
          <li>Melhorar a experiência e a funcionalidade do usuário;</li>
          <li>Cumprir obrigações legais;</li>
          <li>Permitir a descoberta baseada em contatos, combinando seu número de telefone com outros usuários que já o possuem em seus contatos.</li>
        </ol>
        <p>Não vendemos seus dados pessoais. Não compartilhamos seus dados pessoais com terceiros para os próprios fins de marketing deles.</p>

        <h2>4. Base Legal para Processamento (GDPR / LGPD)</h2>
        <p>Nós processamos seus dados com base em:</p>
        <ul>
          <li>Consentimento — quando você cria uma conta ou concorda com esta Política;</li>
          <li>Necessidade contratual — para fornecer e operar o Serviço, incluindo a economia virtual;</li>
          <li>Interesse legítimo — para manter a segurança, evitar uso indevido (como exploração de latência) e melhorar a funcionalidade;</li>
          <li>Obrigação legal — quando exigido por lei ou autoridade;</li>
          <li>Consentimento — para dados opcionais, como número de telefone e quaisquer recursos de descoberta baseados em contatos.</li>
        </ul>

        <h2>5. Retenção de Dados</h2>
        <p>Retemos seus dados pessoais apenas pelo tempo necessário para as finalidades descritas acima:</p>
        <ul>
          <li>Dados da Conta e da Economia Virtual — enquanto sua conta estiver ativa ou até a solicitação de exclusão;</li>
          <li>Registros de uso — até 24 meses;</li>
          <li>Registros legais: conforme exigido pela legislação aplicável.</li>
        </ul>
        <p>Assim que não forem mais necessários, os dados serão excluídos de forma segura ou anonimizados.</p>

        <h2>6. Compartilhamento e Transferência de Dados</h2>
        <p>Podemos compartilhar dados limitados com:</p>
        <ul>
          <li>Provedores de serviços que auxiliam nas operações, hospedagem ou segurança do aplicativo;</li>
          <li>Parceiros de análise e dados esportivos, fornecendo dados de interação de partidas anonimizados, necessários e agregados para resolver resultados gamificados, sincronizar feeds de pontuação ao vivo e manter a integridade de nossas mecânicas de previsão ao vivo;</li>
          <li>Provedores de processamento de IA (sistemas de terceiros gerando insights);</li>
          <li>Autoridades legais, quando exigido por lei.</li>
        </ul>
        <p>Como nossas operações são gerenciadas a partir de Chipre, seus dados podem ser transferidos para outros países, inclusive fora do EEE ou Brasil. Asseguramos que tais transferências estejam protegidas por cláusulas contratuais padrão e salvaguardas equivalentes.</p>

        <h2>7. Segurança de Dados</h2>
        <p>Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados contra perda, uso indevido ou acesso não autorizado — incluindo criptografia, controles de acesso e sistemas de armazenamento seguro. No entanto, nenhum sistema é 100% seguro, e você usa o SirBro por sua própria conta e risco.</p>

        <h2>8. Seus Direitos</h2>
        <p>Dependendo de sua jurisdição, você tem o direito de:</p>
        <ul>
          <li>Acessar e obter uma cópia de seus dados;</li>
          <li>Solicitar correção ou exclusão;</li>
          <li>Retirar o consentimento;</li>
          <li>Opor-se ou restringir o processamento;</li>
          <li>Solicitar portabilidade de dados;</li>
          <li>Adicionar ou remover seu número de telefone a qualquer momento nas configurações do aplicativo;</li>
          <li>Desativar os recursos de descoberta baseada em contatos a qualquer momento.</li>
        </ul>
        <p>Para exercer esses direitos, contate legal@levantemai.pro. Podemos verificar sua identidade antes de processar sua solicitação.</p>

        <h2>9. Privacidade de Menores</h2>
        <p>O SirBro é destinado apenas a usuários com 18 anos ou mais. Não coletamos ou processamos intencionalmente dados de menores. Se você acredita que um menor nos forneceu informações, entre em contato com legal@levantemai.pro para exclusão imediata.</p>

        <h2>10. Alterações nesta Política</h2>
        <p>Podemos atualizar esta Política de Privacidade de tempos em tempos. As atualizações serão publicadas dentro do aplicativo ou em nosso link designado. O uso contínuo do SirBro após uma atualização significa que você aceita a versão revisada.</p>

        <h2>11. Fale Conosco</h2>
        <p>Para questões de privacidade ou proteção de dados: legal@levantemai.pro</p>
        <p>Para suporte técnico ou ao usuário: support@levantemai.pro</p>

        <p className="mt-8 text-secondary">© 2026 Levantem AI LTD. Todos os direitos reservados.</p>
      </div>
    );
  }

  if (locale === 'es') {
    return (
      <div className="space-y-6 text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_p]:mb-4">
        <p>
          Esta Política de Privacidad explica cómo Levantem AI LTD (&quot;nosotros&quot;, &quot;nuestro&quot;, &quot;nos&quot;) recopila, utiliza y protege su información cuando utiliza la aplicación móvil SirBro y los servicios relacionados (colectivamente, el &quot;Servicio&quot;).
        </p>
        <p>Al utilizar SirBro, acepta esta Política de Privacidad. Si no está de acuerdo, por favor no utilice el Servicio.</p>

        <h2>1. Quiénes somos</h2>
        <p><strong>Levantem AI LTD</strong></p>
        <p>Registrada en Chipre</p>
        <p>Dirección: Gladstonos, 116, M.Kyprianou House, 3&amp;4th floor, 3032, Limasol, Chipre</p>
        <p>Contacto (solicitudes legales/datos): legal@levantemai.pro</p>
        <p>Contacto (soporte): support@levantemai.pro</p>
        <p>Somos los responsables del tratamiento de sus datos personales en virtud de las leyes de protección de datos aplicables, incluido el Reglamento General de Protección de Datos (RGPD) de la UE y la Ley General de Protección de Datos (LGPD) de Brasil.</p>

        <h2>2. Datos que recopilamos</h2>

        <h3>a. Información de la cuenta</h3>
        <ul>
          <li>Nombre</li>
          <li>Dirección de correo electrónico</li>
        </ul>
        <p>Se utiliza para crear y administrar su cuenta, verificar la identidad y comunicar actualizaciones esenciales.</p>

        <h3>b. Datos de ubicación</h3>
        <p>Ubicación aproximada (país/región), derivada de la configuración del dispositivo o IP.</p>
        <p>Se utiliza para mostrar datos de fútbol y predicciones relevantes a nivel regional.</p>

        <h3>c. Información de uso</h3>
        <p>Interacciones con la aplicación, duración de la sesión, funciones utilizadas, tipo de dispositivo y versión de la aplicación.</p>
        <p>Se utiliza para comprender el rendimiento de la aplicación y mejorar la experiencia del usuario.</p>

        <h3>d. Datos de interacción de IA</h3>
        <p>Entradas de texto o preguntas que envía a los sistemas de IA de SirBro.</p>
        <p>Se utiliza para generar respuestas y mejorar la calidad del servicio.</p>

        <h3>e. Número de teléfono (Opcional)</h3>
        <p>Ayuda a otros usuarios que ya tienen su número en sus contactos a encontrarlo y conectarse con usted.</p>
        <p>Habilita funciones de descubrimiento basadas en contactos dentro de la aplicación.</p>
        <p>Su número de teléfono no es visible públicamente y solo se utiliza para fines de coincidencia segura.</p>

        <h3>f. Datos de la economía virtual</h3>
        <p>Su saldo de Bro Points (BP) virtuales, inventario de Cartas de Gamificación, estado de suscripción y su historial de &quot;Picks&quot; y predicciones activas y cerradas.</p>
        <p>Se utiliza para administrar su progresión en la aplicación, su rango y su cartera virtual.</p>

        <h3>g. Datos de interacción de alta frecuencia</h3>
        <p>Datos de interacción en tiempo real durante eventos deportivos en vivo, incluido el tiempo de pantalla, toques de botones, duraciones de sesión y métricas de participación en partidos en vivo.</p>
        <p>Se utiliza para facilitar las mecánicas de predicción en vivo, optimizar la latencia de la fuente de datos, calcular los algoritmos de mercado gamificados y prevenir el abuso de la plataforma o exploits técnicos.</p>

        <h2>3. Cómo utilizamos sus datos</h2>
        <p>Utilizamos su información para:</p>
        <ol>
          <li>Operar y mantener el Servicio;</li>
          <li>Procesar sus predicciones deportivas, administrar sus Bro Points (BP) virtuales y resolver los resultados gamificados;</li>
          <li>Personalizar el contenido de la aplicación y la información generada por IA;</li>
          <li>Habilitar la comunicación entre los usuarios a través del chat de la aplicación;</li>
          <li>Monitorear la salud de nuestras conexiones WebSocket en vivo durante eventos deportivos en vivo;</li>
          <li>Responder a consultas y brindar soporte;</li>
          <li>Detectar y prevenir el uso indebido, la actividad fraudulenta o el abuso de la red (incluido el arbitraje de latencia);</li>
          <li>Mejorar la experiencia del usuario y la funcionalidad;</li>
          <li>Cumplir con las obligaciones legales;</li>
          <li>Habilitar el descubrimiento basado en contactos al hacer coincidir su número de teléfono con otros usuarios que ya lo tienen en sus contactos.</li>
        </ol>
        <p>No vendemos sus datos personales. No compartimos sus datos personales con terceros para sus propios fines de marketing.</p>

        <h2>4. Base legal para el procesamiento (RGPD / LGPD)</h2>
        <p>Procesamos sus datos basándonos en:</p>
        <ul>
          <li>Consentimiento — cuando crea una cuenta o acepta esta Política;</li>
          <li>Necesidad contractual — para proporcionar y operar el Servicio, incluida la economía virtual;</li>
          <li>Interés legítimo — para mantener la seguridad, prevenir el uso indebido (como la explotación de latencia) y mejorar la funcionalidad;</li>
          <li>Obligación legal — cuando lo exija la ley o la autoridad;</li>
          <li>Consentimiento — para datos opcionales, como el número de teléfono y cualquier función de descubrimiento basada en contactos.</li>
        </ul>

        <h2>5. Retención de datos</h2>
        <p>Retenemos sus datos personales solo el tiempo necesario para los fines descritos anteriormente:</p>
        <ul>
          <li>Datos de la cuenta y de la economía virtual — mientras su cuenta esté activa o hasta que solicite su eliminación;</li>
          <li>Registros de uso — hasta 24 meses;</li>
          <li>Registros legales — según lo exija la ley aplicable.</li>
        </ul>
        <p>Una vez que ya no son necesarios, los datos se eliminan o anonimizan de forma segura.</p>

        <h2>6. Intercambio y transferencia de datos</h2>
        <p>Podemos compartir datos limitados con:</p>
        <ul>
          <li>Proveedores de servicios que asisten en las operaciones de la aplicación, el alojamiento o la seguridad;</li>
          <li>Socios de datos y análisis deportivos, proporcionando datos de interacción de partidos necesarios, anonimizados y agregados para resolver resultados gamificados, sincronizar transmisiones de puntuación en vivo y mantener la integridad de nuestras mecánicas de predicción en vivo;</li>
          <li>Proveedores de procesamiento de IA (sistemas de terceros que generan información);</li>
          <li>Autoridades legales, cuando lo exija la ley.</li>
        </ul>
        <p>Debido a que nuestras operaciones se administran desde Chipre, sus datos pueden transferirse a otros países, incluidos aquellos fuera del EEE o Brasil. Nos aseguramos de que dichas transferencias estén protegidas por cláusulas contractuales tipo y salvaguardias equivalentes.</p>

        <h2>7. Seguridad de los datos</h2>
        <p>Implementamos medidas técnicas y organizativas adecuadas para proteger sus datos contra la pérdida, el uso indebido o el acceso no autorizado, incluido el cifrado, los controles de acceso y los sistemas de almacenamiento seguro. Sin embargo, ningún sistema es 100% seguro y usted usa SirBro bajo su propio riesgo.</p>

        <h2>8. Sus derechos</h2>
        <p>Dependiendo de su jurisdicción, tiene derecho a:</p>
        <ul>
          <li>Acceder y obtener una copia de sus datos;</li>
          <li>Solicitar su corrección o eliminación;</li>
          <li>Retirar el consentimiento;</li>
          <li>Oponerse o restringir el procesamiento;</li>
          <li>Solicitar la portabilidad de los datos;</li>
          <li>Agregar o eliminar su número de teléfono en cualquier momento en la configuración de la aplicación;</li>
          <li>Desactivar las funciones de descubrimiento basadas en contactos en cualquier momento.</li>
        </ul>
        <p>Para ejercer estos derechos, contacte a legal@levantemai.pro. Es posible que verifiquemos su identidad antes de procesar su solicitud.</p>

        <h2>9. Privacidad de menores</h2>
        <p>SirBro está destinado únicamente a usuarios mayores de 18 años. No recopilamos ni procesamos a sabiendas datos de menores. Si cree que un menor nos ha proporcionado información, comuníquese con legal@levantemai.pro para su pronta eliminación.</p>

        <h2>10. Cambios a esta Política</h2>
        <p>Podemos actualizar esta Política de Privacidad de vez en cuando. Las actualizaciones se publicarán dentro de la aplicación o en nuestro enlace designado. El uso continuo de SirBro después de una actualización significa que acepta la versión revisada.</p>

        <h2>11. Contáctenos</h2>
        <p>Para asuntos de privacidad o protección de datos: legal@levantemai.pro</p>
        <p>Para soporte técnico o de usuario: support@levantemai.pro</p>

        <p className="mt-8 text-secondary">© 2026 Levantem AI LTD. Todos los derechos reservados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_p]:mb-4">
      <p>
        This Privacy Policy explains how Levantem AI LTD (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) collects, uses, and protects your information when you use the SirBro mobile application and related services (collectively, the &quot;Service&quot;).
      </p>
      <p>By using SirBro, you agree to this Privacy Policy. If you do not agree, please do not use the Service.</p>

      <h2>1. Who We Are</h2>
      <p><strong>Levantem AI LTD</strong></p>
      <p>Registered in Cyprus</p>
      <p>Address: Gladstonos, 116, M.Kyprianou House, 3&amp;4th floor, 3032, Limassol, Cyprus</p>
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

      <h3>f. Virtual Economy Data</h3>
      <p>Your virtual Bro Points (BP) balance, inventory of Gamification Cards, subscription status, and your history of active and closed &quot;Picks&quot; and predictions.</p>
      <p>Used to manage your in-app progression, rank, and virtual portfolio.</p>

      <h3>g. High-Frequency Interaction Data</h3>
      <p>Real-time interaction data during live sporting events, including screen time, button taps, session durations, and live match engagement metrics.</p>
      <p>Used to facilitate live prediction mechanics, optimize data-feed latency, calculate gamified market algorithms, and prevent platform abuse or technical exploits.</p>

      <h2>3. How We Use Your Data</h2>
      <p>We use your information to:</p>
      <ol>
        <li>Operate and maintain the Service;</li>
        <li>Process your sports predictions, manage your virtual Bro Points (BP), and resolve gamified outcomes;</li>
        <li>Personalize app content and AI-generated insights;</li>
        <li>Enable communication between users via in-app chat;</li>
        <li>Monitor the health of our live WebSocket connections during live sports events;</li>
        <li>Respond to inquiries and provide support;</li>
        <li>Detect and prevent misuse, fraudulent activity, or network abuse (including latency arbitrage);</li>
        <li>Improve user experience and functionality;</li>
        <li>Comply with legal obligations;</li>
        <li>Enable contact-based discovery by matching your phone number with other users who already have it in their contacts.</li>
      </ol>
      <p>We do not sell your personal data. We do not share your personal data with third parties for their own marketing purposes.</p>

      <h2>4. Legal Basis for Processing (GDPR / LGPD)</h2>
      <p>We process your data based on:</p>
      <ul>
        <li>Consent — when you create an account or agree to this Policy;</li>
        <li>Contract necessity — to provide and operate the Service, including the virtual economy;</li>
        <li>Legitimate interest — to maintain security, prevent misuse (such as latency exploitation), and improve functionality;</li>
        <li>Legal obligation — when required by law or authority;</li>
        <li>Consent — for optional data such as phone number and any contact-based discovery features.</li>
      </ul>

      <h2>5. Data Retention</h2>
      <p>We retain your personal data only as long as necessary for the purposes described above:</p>
      <ul>
        <li>Account and Virtual Economy data — while your account is active or until deletion request;</li>
        <li>Usage logs — up to 24 months;</li>
        <li>Legal records — as required by applicable law.</li>
      </ul>
      <p>Once no longer needed, data is securely deleted or anonymized.</p>

      <h2>6. Data Sharing and Transfers</h2>
      <p>We may share limited data with:</p>
      <ul>
        <li>Service providers assisting in app operations, hosting, or security;</li>
        <li>Sports data and analytics partners, providing necessary, anonymized, and aggregated match-interaction data to resolve gamified outcomes, synchronize live scoring feeds, and maintain the integrity of our live prediction mechanics;</li>
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
      <p>We may update this Privacy Policy from time to time. Updates will be posted within the app or at our designated link. Continued use of SirBro after an update means you accept the revised version.</p>

      <h2>11. Contact Us</h2>
      <p>For data protection or privacy matters: legal@levantemai.pro</p>
      <p>For user or technical support: support@levantemai.pro</p>

      <p className="mt-8 text-secondary">© 2026 Levantem AI LTD. All rights reserved.</p>
    </div>
  );
}
