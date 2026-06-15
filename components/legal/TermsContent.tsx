import type { Locale } from '@/lib/i18n/config';

type TermsContentProps = {
  locale?: Locale;
};

export function TermsContent({ locale = 'en' }: TermsContentProps) {
  if (locale === 'es') {
    return (
      <div className="space-y-6 text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_p]:mb-4">
        <p>
          Bienvenido a SirBro, una aplicación de comunidad e información deportiva impulsada por IA, operada por Levantem AI LTD, una empresa registrada en Chipre (dirección: Gladstonos, 116, M.Kyprianou House, 3&amp;4th floor, 3032, Limasol, Chipre).
        </p>
        <p>
          Estos Términos de Servicio (&quot;Términos&quot;) rigen su acceso y uso de la aplicación móvil SirBro y los servicios relacionados (colectivamente, el &quot;Servicio&quot;).
        </p>
        <p>Al acceder o utilizar SirBro, usted acepta estar sujeto a estos Términos. Si no está de acuerdo, no podrá utilizar el Servicio.</p>

        <h2>1. Elegibilidad</h2>
        <p>SirBro está destinado únicamente a usuarios mayores de 18 años. Al utilizar el Servicio, confirma que tiene al menos 18 años de edad y capacidad legal para celebrar contratos vinculantes según la ley aplicable.</p>

        <h2>2. Descripción general del Servicio</h2>
        <p>SirBro ofrece:</p>
        <ul>
          <li>Predicciones deportivas, información y estadísticas generadas por IA;</li>
          <li>Debates y chats comunitarios relacionados con los deportes;</li>
          <li>Acceso a datos de fútbol y herramientas de análisis.</li>
        </ul>
        <p>Todo el contenido y las predicciones proporcionadas dentro de SirBro tienen fines de entretenimiento únicamente. SirBro no ofrece ni promueve juegos de azar, apuestas o asesoramiento financiero de ningún tipo.</p>

        <h2>3. Registro de cuenta</h2>
        <p>Para acceder a ciertas funciones, debe crear una cuenta utilizando su dirección de correo electrónico. Usted acepta proporcionar información precisa y actualizada.</p>

        <h2>4. Uso aceptable</h2>
        <p>Usted acepta no:</p>
        <ul>
          <li>Usar SirBro para cualquier propósito ilegal;</li>
          <li>Compartir, promover o solicitar apuestas o juegos de azar;</li>
          <li>Publicar o compartir contenido dañino, abusivo o engañoso;</li>
          <li>Intentar hackear, aplicar ingeniería inversa o interrumpir el Servicio;</li>
          <li>Usar automatización, bots o scrapers sin permiso.</li>
        </ul>

        <h2>5. Funciones de la comunidad</h2>
        <p>SirBro incluye funciones de chat y comunidad. Usted es el único responsable del contenido que publique. Podemos moderar o eliminar contenido a nuestra discreción para mantener un entorno seguro.</p>

        <h2>6. Contenido generado por IA</h2>
        <p>SirBro utiliza sistemas de IA de terceros. La información generada por IA puede ser inexacta, incompleta o estar desactualizada. Usted acepta utilizar dicha información solo para entretenimiento.</p>

        <h2>7. Propiedad intelectual</h2>
        <p>Todos los materiales dentro del Servicio son propiedad o tienen licencia de Levantem AI LTD. Se le otorga una licencia limitada, no exclusiva e intransferible para usar SirBro únicamente para fines personales y no comerciales.</p>

        <h2>8. Acceso gratuito y suscripciones Premium</h2>
        <p>La Aplicación opera bajo un modelo &quot;freemium&quot;. Los usuarios pueden acceder a una versión gratuita y limitada de la Aplicación que incluye funciones de predicción básicas, límites diarios estándar y progresión básica.</p>
        <p>SirBro también ofrece suscripciones premium opcionales de renovación automática (como los niveles &quot;Playmaker&quot; y &quot;ProBro&quot;) que desbloquean funciones de software mejoradas, límites de predicción diarios más altos, mejoras cosméticas en el perfil y progresión virtual acelerada (multiplicadores de XP/BP).</p>

        <h2>9. Facturación y cancelación de suscripciones</h2>
        <p><strong>Pago:</strong> El pago se cargará a su cuenta de Apple ID o Google Play en el momento de confirmar la compra.</p>
        <p><strong>Renovación automática:</strong> Las suscripciones se renuevan automáticamente a menos que la renovación automática se desactive al menos 24 horas antes del final del período de facturación actual.</p>
        <p><strong>Cargos:</strong> Se le cobrará a su cuenta la renovación dentro de las 24 horas anteriores al final del período actual al precio de suscripción original.</p>
        <p><strong>Gestión:</strong> Puede gestionar o cancelar sus suscripciones yendo a la Configuración de su cuenta de App Store o Google Play después de la compra. SirBro no puede cancelar suscripciones en su nombre.</p>
        <p><strong>Sin reembolsos:</strong> Cualquier porción no utilizada de un período de prueba gratuito, si se ofrece, se perderá cuando se compre una suscripción. Las tarifas de suscripción no son reembolsables, excepto cuando lo exija la ley aplicable.</p>
        <p>La compra de una suscripción premium otorga estrictamente acceso a funciones de software mejoradas, cosméticos visuales y mejoras de calidad de vida en la plataforma. Una tarifa de suscripción es un pago por servicios de software; no es un depósito, una apuesta, una entrada o capital para las mecánicas de predicción en vivo. Si bien las suscripciones pueden aumentar la velocidad a la que los usuarios ganan Bro Points (BP) virtuales a través de multiplicadores, los BP siguen siendo completamente virtuales y sin valor en el mundo real, y no se pueden retirar independientemente del estado de la suscripción.</p>

        <h2>10. Moneda virtual (Bro Points / BP) y Artículos virtuales</h2>
        <p>La Aplicación utiliza una moneda virtual dentro de la aplicación conocida como &quot;Bro Points&quot; (BP) y artículos de inventario virtual (como Cartas de Gamificación y Cofres). Los BP y los artículos virtuales son estrictamente para fines de entretenimiento. No poseen valor monetario en el mundo real, no se pueden canjear por moneda fiduciaria, bienes del mundo real o servicios, y no se pueden transferir, vender o intercambiar fuera de la Aplicación.</p>
        <p>Usted reconoce que no es propietario de los BP ni de los artículos virtuales de su cuenta. Levantem AI LTD le otorga una licencia limitada, personal, no exclusiva, intransferible y revocable para usar los BP y los artículos virtuales únicamente dentro de la Aplicación. Nos reservamos el derecho absoluto de administrar, regular, controlar, modificar o eliminar los BP y los artículos virtuales en cualquier momento, con o sin previo aviso, y sin ninguna responsabilidad hacia usted.</p>

        <h2>11. Gamificación en vivo y &quot;Picks&quot;</h2>
        <p>La Aplicación presenta mecánicas de predicción en vivo (incluidos &quot;Desafíos de partidos en vivo&quot; y simulaciones de mercado) donde los usuarios pueden usar BP para respaldar ciertos resultados deportivos mediante la adquisición de &quot;Picks&quot;. Estas mecánicas son juegos simulados de habilidad y entretenimiento. Adquirir un Pick no constituye la compra de un derivado financiero, valor, materia prima ni la realización de una apuesta con dinero real. Los &quot;BP Netos&quot; calculados durante los partidos en vivo son simulaciones determinadas algorítmicamente y basadas en fuentes de datos deportivos de terceros y no representan precios de mercados financieros.</p>

        <h2>12. Suspensión del mercado, errores y derechos de anulación</h2>
        <p>Los datos deportivos en vivo están sujetos a retrasos, interrupciones e inexactitudes. Levantem AI LTD se reserva el derecho, a su entera y absoluta discreción, de detener, suspender o cancelar cualquier mercado de predicción en vivo o evento en cualquier momento, incluso durante instancias de revisión del Árbitro Asistente de Video (VAR), lesiones o anomalías en la fuente de datos.</p>
        <p>Si un error técnico, un problema de latencia, un retraso en la transmisión o la manipulación de la fuente de datos permite a un usuario adquirir o cerrar &quot;Picks&quot; a valores de BP incorrectos (por ejemplo, &quot;arbitraje de latencia&quot;), Levantem AI LTD se reserva el derecho de anular esos Picks específicos, revertir la transacción y deducir los BP correspondientes de la cuenta del usuario sin previo aviso.</p>

        <h2>13. Renuncia de garantías</h2>
        <p>SirBro se proporciona &quot;tal cual&quot; y &quot;según disponibilidad&quot;. Levantem AI LTD no ofrece garantías con respecto a la precisión, confiabilidad o disponibilidad del Servicio.</p>

        <h2>14. Limitación de responsabilidad</h2>
        <p>En la máxima medida permitida por la ley, Levantem AI LTD no será responsable de ningún daño indirecto, incidental o consecuente que resulte de su uso de SirBro.</p>

        <h2>15. Cambios a estos Términos</h2>
        <p>Podemos modificar estos Términos en cualquier momento. El uso continuo después de los cambios significa que acepta los Términos actualizados.</p>

        <h2>16. Ley aplicable</h2>
        <p>Estos Términos se rigen por las leyes de Chipre. Cualquier disputa se resolverá en los tribunales de Limasol, Chipre.</p>

        <h2>17. Contacto</h2>
        <p>Para consultas legales: legal@levantemai.pro</p>
        <p>Para soporte general: support@levantemai.pro</p>

        <p className="mt-8 text-secondary">&copy; 2026 Levantem AI LTD. Todos los derechos reservados.</p>
      </div>
    );
  }

  if (locale === 'pt') {
    return (
      <div className="space-y-6 text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_p]:mb-4">
        <p>
          Bem-vindo ao SirBro, um aplicativo de comunidade e insights esportivos impulsionado por IA, operado pela Levantem AI LTD, uma empresa registrada em Chipre (endereço: Gladstonos, 116, M.Kyprianou House, 3&amp;4th floor, 3032, Limassol, Chipre).
        </p>
        <p>
          Estes Termos de Serviço (&quot;Termos&quot;) regem o seu acesso e uso do aplicativo móvel SirBro e dos serviços relacionados (coletivamente, o &quot;Serviço&quot;).
        </p>
        <p>Ao acessar ou utilizar o SirBro, você concorda em ficar vinculado a estes Termos. Se você não concordar, não poderá usar o Serviço.</p>

        <h2>1. Elegibilidade</h2>
        <p>O SirBro é destinado apenas a usuários com 18 anos ou mais. Ao utilizar o Serviço, você confirma que tem pelo menos 18 anos de idade e capacidade legal para celebrar contratos vinculantes de acordo com a legislação aplicável.</p>

        <h2>2. Visão Geral do Serviço</h2>
        <p>O SirBro fornece:</p>
        <ul>
          <li>Previsões esportivas, insights e estatísticas geradas por IA;</li>
          <li>Discussões relacionadas a esportes e chats da comunidade;</li>
          <li>Acesso a dados de futebol e ferramentas de análise.</li>
        </ul>
        <p>Todo o conteúdo e as previsões fornecidas dentro do SirBro são apenas para fins de entretenimento. O SirBro não oferece nem promove jogos de azar, apostas ou aconselhamento financeiro de qualquer tipo.</p>

        <h2>3. Registro de Conta</h2>
        <p>Para acessar determinados recursos, você deve criar uma conta usando seu endereço de e-mail. Você concorda em fornecer informações precisas e atualizadas.</p>

        <h2>4. Uso Aceitável</h2>
        <p>Você concorda em não:</p>
        <ul>
          <li>Usar o SirBro para qualquer finalidade ilegal;</li>
          <li>Compartilhar, promover ou solicitar apostas ou jogos de azar;</li>
          <li>Publicar ou compartilhar conteúdo prejudicial, abusivo ou enganoso;</li>
          <li>Tentar hackear, fazer engenharia reversa ou interromper o Serviço;</li>
          <li>Usar automação, bots ou scrapers sem permissão.</li>
        </ul>

        <h2>5. Recursos da Comunidade</h2>
        <p>O SirBro inclui funções de chat e comunidade. Você é o único responsável pelo conteúdo que publica. Podemos moderar ou remover conteúdo a nosso critério para manter um ambiente seguro.</p>

        <h2>6. Conteúdo Gerado por IA</h2>
        <p>O SirBro usa sistemas de IA de terceiros. As informações geradas por IA podem ser imprecisas, incompletas ou estar desatualizadas. Você concorda em usar tais informações apenas para entretenimento.</p>

        <h2>7. Propriedade Intelectual</h2>
        <p>Todos os materiais dentro do Serviço são de propriedade ou licenciados pela Levantem AI LTD. É concedida a você uma licença limitada, não exclusiva e intransferível para usar o SirBro exclusivamente para fins pessoais e não comerciais.</p>

        <h2>8. Acesso Gratuito e Assinaturas Premium</h2>
        <p>O Aplicativo opera em um modelo &quot;freemium&quot;. Os usuários podem acessar uma versão gratuita e limitada do Aplicativo que inclui recursos básicos de previsão, limites diários padrão e progressão básica.</p>
        <p>O SirBro também oferece assinaturas premium opcionais com renovação automática (como os níveis &quot;Playmaker&quot; e &quot;ProBro&quot;) que desbloqueiam funcionalidades aprimoradas de software, limites diários mais altos de previsões, melhorias visuais de perfil e progressão virtual acelerada (multiplicadores de XP/BP).</p>

        <h2>9. Faturamento e Cancelamento de Assinatura</h2>
        <p><strong>Pagamento:</strong> O pagamento será cobrado em sua conta Apple ID ou Google Play na confirmação da compra.</p>
        <p><strong>Renovação Automática:</strong> As assinaturas são renovadas automaticamente, a menos que a renovação automática seja desativada pelo menos 24 horas antes do final do período de faturamento atual.</p>
        <p><strong>Cobranças:</strong> Sua conta será cobrada pela renovação dentro de 24 horas antes do final do período atual pelo preço original da assinatura.</p>
        <p><strong>Gerenciamento:</strong> Você pode gerenciar ou cancelar suas assinaturas acessando as Configurações da Conta da sua App Store ou Google Play após a compra. O SirBro não pode cancelar assinaturas em seu nome.</p>
        <p><strong>Sem Reembolsos:</strong> Qualquer parte não utilizada de um período de teste gratuito, se oferecido, será perdida quando uma assinatura for comprada. As taxas de assinatura não são reembolsáveis, exceto onde exigido pela legislação aplicável.</p>
        <p>A compra de uma assinatura premium concede acesso estrito a recursos aprimorados de software, cosméticos visuais e melhorias de qualidade de vida na plataforma. Uma taxa de assinatura é um pagamento por serviços de software; não é um depósito, uma aposta, um cacife (buy-in) ou capital para as mecânicas de previsão ao vivo. Embora as assinaturas possam aumentar a taxa na qual os usuários ganham Bro Points (BP) virtuais por meio de multiplicadores, os BP permanecem inteiramente virtuais com zero valor no mundo real, e não podem ser sacados, independentemente do status da assinatura.</p>

        <h2>10. Moeda Virtual (Bro Points / BP) e Itens Virtuais</h2>
        <p>O Aplicativo utiliza uma moeda virtual interna conhecida como &quot;Bro Points&quot; (BP) e itens de inventário virtuais (como Cartas de Gamificação e Baús). Os BP e os itens virtuais são estritamente para fins de entretenimento. Eles não possuem valor monetário no mundo real, não podem ser trocados por moeda fiduciária, bens ou serviços do mundo real, e não podem ser transferidos, vendidos ou trocados fora do Aplicativo.</p>
        <p>Você reconhece que não é o proprietário dos BP ou itens virtuais em sua conta. A Levantem AI LTD concede a você uma licença limitada, pessoal, não exclusiva, intransferível e revogável para usar os BP e itens virtuais exclusivamente dentro do Aplicativo. Reservamo-nos o direito absoluto de gerenciar, regular, controlar, modificar ou eliminar BP e itens virtuais a qualquer momento, com ou sem aviso prévio, e sem qualquer responsabilidade perante você.</p>

        <h2>11. Gamificação ao Vivo e &quot;Picks&quot;</h2>
        <p>O Aplicativo apresenta mecânicas de previsão ao vivo (incluindo &quot;Desafios de Partidas ao Vivo&quot; e simulações de mercado) onde os usuários podem usar BP para apoiar determinados resultados esportivos adquirindo &quot;Picks&quot;. Essas mecânicas são jogos simulados de habilidade e entretenimento. Adquirir um Pick não constitui a compra de um derivativo financeiro, valor mobiliário, commodity ou a realização de uma aposta com dinheiro real. Os &quot;BP Líquidos&quot; calculados durante as partidas ao vivo são simulações determinadas algoritmicamente com base em feeds de dados esportivos de terceiros e não representam precificação de mercado financeiro.</p>

        <h2>12. Suspensões de Mercado, Erros e Direitos de Anulação</h2>
        <p>Dados esportivos ao vivo estão sujeitos a atrasos, interrupções e imprecisões. A Levantem AI LTD reserva-se o direito, a seu exclusivo e absoluto critério, de suspender, interromper ou cancelar quaisquer mercados de previsão ao vivo ou eventos a qualquer momento, inclusive durante instâncias de verificações do Árbitro Assistente de Vídeo (VAR), lesões ou anomalias no feed de dados.</p>
        <p>Se um erro técnico, problema de latência, atraso de transmissão ou manipulação do feed de dados permitir que um usuário adquira ou feche &quot;Picks&quot; a valores incorretos de BP (por exemplo, &quot;arbitragem de latência&quot;), a Levantem AI LTD reserva-se o direito de anular esses Picks específicos, reverter a transação e deduzir os BP correspondentes da conta do usuário sem aviso prévio.</p>

        <h2>13. Isenção de Garantias</h2>
        <p>O SirBro é fornecido &quot;no estado em que se encontra&quot; e &quot;conforme disponível&quot;. A Levantem AI LTD não oferece garantias em relação à precisão, confiabilidade ou disponibilidade do Serviço.</p>

        <h2>14. Limitação de Responsabilidade</h2>
        <p>Até a extensão máxima permitida por lei, a Levantem AI LTD não será responsável por quaisquer danos indiretos, incidentais ou consequenciais resultantes do seu uso do SirBro.</p>

        <h2>15. Alterações nestes Termos</h2>
        <p>Podemos modificar estes Termos a qualquer momento. O uso contínuo após as alterações significa que você aceita os Termos atualizados.</p>

        <h2>16. Lei Aplicável</h2>
        <p>Estes Termos são regidos pelas leis de Chipre. Quaisquer disputas serão resolvidas nos tribunais de Limassol, Chipre.</p>

        <h2>17. Contato</h2>
        <p>Para questões legais: legal@levantemai.pro</p>
        <p>Para suporte geral: support@levantemai.pro</p>

        <p className="mt-8 text-secondary">&copy; 2026 Levantem AI LTD. Todos os direitos reservados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_p]:mb-4">
      <p>
        Welcome to SirBro, an AI-powered sports insights and community app operated by Levantem AI LTD, a company registered in Cyprus (address: Gladstonos, 116, M.Kyprianou House, 3&amp;4th floor, 3032, Limassol, Cyprus).
      </p>
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of the SirBro mobile application and related services (collectively, the &quot;Service&quot;).
      </p>
      <p>By accessing or using SirBro, you agree to be bound by these Terms. If you do not agree, you may not use the Service.</p>

      <h2>1. Eligibility</h2>
      <p>SirBro is intended only for users aged 18 or older. By using the Service, you confirm that you are at least 18 years of age and legally capable of entering into binding contracts under applicable law.</p>

      <h2>2. Overview of the Service</h2>
      <p>SirBro provides:</p>
      <ul>
        <li>AI-generated sports predictions, insights, and statistics;</li>
        <li>Sports-related discussions and community chats;</li>
        <li>Access to football data and analysis tools.</li>
      </ul>
      <p>All content and predictions provided within SirBro are for entertainment purposes only. SirBro does not offer or promote gambling, betting, or financial advice of any kind.</p>

      <h2>3. Account Registration</h2>
      <p>To access certain features, you must create an account using your email address. You agree to provide accurate and up-to-date information.</p>

      <h2>4. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use SirBro for any unlawful purpose;</li>
        <li>Share, promote, or solicit betting or gambling;</li>
        <li>Post or share harmful, abusive, or misleading content;</li>
        <li>Attempt to hack, reverse-engineer, or disrupt the Service;</li>
        <li>Use automation, bots, or scrapers without permission.</li>
      </ul>

      <h2>5. Community Features</h2>
      <p>SirBro includes chat and community functions. You are solely responsible for the content you post. We may moderate or remove content at our discretion to maintain a safe environment.</p>

      <h2>6. AI-Generated Content</h2>
      <p>SirBro uses third-party AI systems. AI-generated information may be inaccurate, incomplete, or outdated. You agree to use such information for entertainment only.</p>

      <h2>7. Intellectual Property</h2>
      <p>All materials within the Service are owned or licensed by Levantem AI LTD. You are granted a limited, non-exclusive, non-transferable license to use SirBro solely for personal, non-commercial purposes.</p>

      <h2>8. Free Access and Premium Subscriptions</h2>
      <p>The App operates on a &quot;freemium&quot; model. Users may access a limited, free version of the App which includes base prediction features, standard daily limits, and basic progression.</p>
      <p>Sirbro also offers optional, auto-renewing premium subscriptions (such as the &quot;Playmaker&quot; and &quot;ProBro&quot; tiers) that unlock enhanced software functionality, higher daily prediction caps, cosmetic profile upgrades, and accelerated virtual progression (XP/BP multipliers).</p>

      <h2>9. Subscription Billing and Cancellation</h2>
      <p><strong>Payment:</strong> Payment will be charged to your Apple ID or Google Play account at the confirmation of purchase.</p>
      <p><strong>Auto-Renewal:</strong> Subscriptions automatically renew unless auto-renew is turned off at least 24 hours before the end of the current billing period.</p>
      <p><strong>Charges:</strong> Your account will be charged for renewal within 24 hours prior to the end of the current period at the original subscription price.</p>
      <p><strong>Management:</strong> You can manage or cancel your subscriptions by going to your App Store or Google Play Account Settings after purchase. Sirbro cannot cancel subscriptions on your behalf.</p>
      <p><strong>No Refunds:</strong> Any unused portion of a free trial period, if offered, will be forfeited when a subscription is purchased. Subscription fees are non-refundable, except where required by applicable law.</p>
      <p>Purchasing a premium subscription strictly grants access to enhanced software features, visual cosmetics, and quality-of-life platform upgrades. A subscription fee is a payment for software services; it is not a deposit, a wager, a buy-in, or capital for the live prediction mechanics. While subscriptions may increase the rate at which users earn virtual Bro Points (BP) through multipliers, BP remains entirely virtual with zero real-world value, and cannot be withdrawn regardless of subscription status.</p>

      <h2>10. Virtual Currency (Bro Points / BP) and Virtual Items</h2>
      <p>The App utilizes a virtual, in-app currency known as &quot;Bro Points&quot; (BP) and virtual inventory items (such as Gamification Cards and Chests). BP and virtual items are strictly for entertainment purposes. They possess no real-world monetary value, cannot be redeemed for fiat currency, real-world goods, or services, and cannot be transferred, sold, or exchanged outside of the App.</p>
      <p>You acknowledge that you do not own the BP or virtual items in your account. Levantem AI LTD grants you a limited, personal, non-exclusive, non-transferable, and revocable license to use BP and virtual items solely within the App. We reserve the absolute right to manage, regulate, control, modify, or eliminate BP and virtual items at any time, with or without notice, and without any liability to you.</p>

      <h2>11. Live Gamification and &quot;Picks&quot;</h2>
      <p>The App features live prediction mechanics (including &quot;Live Match Challenges&quot; and market simulations) where users can use BP to back certain sports outcomes by acquiring &quot;Picks.&quot; These mechanics are simulated games of skill and entertainment. Acquiring a Pick does not constitute purchasing a financial derivative, security, commodity, or placing a real-money wager. The &quot;Net BP&quot; calculated during live matches are algorithmically determined simulations based on third-party sports data feeds and do not represent financial market pricing.</p>

      <h2>12. Market Halts, Errors, and Voiding Rights</h2>
      <p>Live sports data is subject to delays, interruptions, and inaccuracies. Levantem AI LTD reserves the right, at its sole and absolute discretion, to halt, suspend, or cancel any live prediction markets or events at any time, including during instances of Video Assistant Referee (VAR) checks, injuries, or data feed anomalies.</p>
      <p>If a technical error, latency issue, broadcast delay, or data feed manipulation allows a user to acquire or close &quot;Picks&quot; at incorrect BP values (e.g., &quot;latency arbitrage&quot;), Levantem AI LTD reserves the right to void those specific Picks, reverse the transaction, and deduct the corresponding BP from the user&apos;s account without prior notice.</p>

      <h2>13. Disclaimer of Warranties</h2>
      <p>SirBro is provided on an &quot;as is&quot; and &quot;as available&quot; basis. Levantem AI LTD makes no warranties regarding accuracy, reliability, or availability of the Service.</p>

      <h2>14. Limitation of Liability</h2>
      <p>To the fullest extent permitted by law, Levantem AI LTD shall not be liable for any indirect, incidental, or consequential damages resulting from your use of SirBro.</p>

      <h2>15. Changes to These Terms</h2>
      <p>We may modify these Terms at any time. Continued use after changes means you accept the updated Terms.</p>

      <h2>16. Governing Law</h2>
      <p>These Terms are governed by the laws of Cyprus. Any disputes shall be resolved in the courts of Limassol, Cyprus.</p>

      <h2>17. Contact</h2>
      <p>For legal inquiries: legal@levantemai.pro</p>
      <p>For general support: support@levantemai.pro</p>

      <p className="mt-8 text-secondary">&copy; 2026 Levantem AI LTD. All rights reserved.</p>
    </div>
  );
}
