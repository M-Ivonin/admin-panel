import type { Locale } from '@/lib/i18n/config';

type DisclaimerContentProps = {
  locale?: Locale;
};

export function DisclaimerContent({ locale = 'en' }: DisclaimerContentProps) {
  if (locale === 'es') {
    return (
      <div className="space-y-6 text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_p]:mb-4">
        <p className="text-secondary">
          Al instalar, acceder o utilizar SirBro, confirma que ha leído, comprendido y aceptado todos los términos, políticas y condiciones descritos en este documento.
        </p>

        <h2>1. No es una plataforma de apuestas o juegos de azar</h2>
        <p>SirBro es estrictamente una plataforma social gratuita de gamificación y predicción deportiva. No ofrecemos juegos de azar con dinero real, apuestas deportivas ni loterías. Si bien los usuarios pueden optar por comprar suscripciones opcionales de renovación automática para desbloquear funciones de software premium, mejoras cosméticas visuales y límites de interacción diarios más altos, estos pagos son estrictamente tarifas de suscripción de software, no depósitos ni apuestas.</p>
        <p>Los usuarios no pueden depositar moneda fiduciaria para apostar en deportes, ni pueden retirar o canjear la moneda de la aplicación (BP) o los artículos virtuales por dinero real. Cualquier referencia a &quot;respaldos&quot;, &quot;selecciones&quot; (picks), &quot;costos&quot;, &quot;recompensas&quot; o &quot;mercados&quot; se refiere exclusivamente a la economía simulada y gamificada dentro de la aplicación.</p>

        <h2>2. No es un mercado financiero</h2>
        <p>SirBro no es un corredor de bolsa registrado, un mercado financiero ni un asesor de inversiones. Las mecánicas de predicción en vivo y los gráficos que se muestran en la aplicación son funciones de entretenimiento simuladas diseñadas para imitar la emoción del impulso de los deportes en vivo. No representan mercados financieros reales, y los &quot;Picks&quot; no son valores, materias primas, opciones ni instrumentos financieros.</p>

        <h2>3. No afiliación de la plataforma</h2>
        <p>Apple Inc., Google LLC y Meta Platforms, Inc. no son patrocinadores de, ni están afiliados de ninguna manera con, los concursos, desafíos de predicción o mecánicas de gamificación proporcionadas dentro de la aplicación SirBro.</p>

        <h2>4. Solo para entretenimiento</h2>
        <p>Todas las predicciones, información, estadísticas y contenido generado por IA proporcionados por SirBro tienen fines informativos y de entretenimiento únicamente. SirBro no garantiza la precisión, integridad o confiabilidad de ninguna información proporcionada. Los usuarios no deben confiar en esta información para tomar decisiones financieras o de apuestas.</p>

        <h2>5. Contenido generado por IA</h2>
        <p>El contenido generado por sistemas de IA puede ser inexacto, incompleto, desactualizado o engañoso. Los modelos de IA se entrenan con datos históricos y pueden no reflejar eventos o condiciones actuales. Los usuarios reconocen que las predicciones de IA son estimaciones probabilísticas y no deben tratarse como hechos o garantías.</p>

        <h2>6. No es asesoramiento financiero</h2>
        <p>SirBro no brinda asesoramiento financiero, de inversión ni de apuestas. Nada en la aplicación debe interpretarse como una recomendación para realizar apuestas o tomar decisiones financieras. Los usuarios son los únicos responsables de sus propias decisiones y acciones.</p>

        <h2>7. Servicios de terceros</h2>
        <p>SirBro puede mostrar datos de fuentes de terceros (por ejemplo, estadísticas deportivas, resultados de partidos). No somos responsables de la exactitud o disponibilidad de los datos de terceros.</p>

        <h2>8. Responsabilidad del usuario</h2>
        <p>Los usuarios deben cumplir con todas las leyes aplicables en su jurisdicción. Si las apuestas o los juegos de azar son ilegales en su ubicación, no debe utilizar SirBro para tales fines. Los usuarios son responsables de comprender y seguir las regulaciones locales.</p>

        <h2>9. Restricción de edad</h2>
        <p>SirBro está destinado únicamente a usuarios mayores de 18 años. Al utilizar la aplicación, confirma que cumple con este requisito de edad.</p>

        <h2>10. Limitación de responsabilidad</h2>
        <p>Levantem AI LTD no será responsable de ninguna pérdida, daño o consecuencia que surja del uso de SirBro, incluidos, entre otros:</p>
        <ul>
          <li>Pérdidas financieras por apuestas o juegos de azar;</li>
          <li>Predicciones o información inexactas;</li>
          <li>Interrupciones del servicio o problemas técnicos;</li>
          <li>Acciones o datos de terceros.</li>
        </ul>

        <h2>11. Cambios a este Descargo de responsabilidad</h2>
        <p>Podemos actualizar este Descargo de responsabilidad en cualquier momento. El uso continuo de la aplicación después de los cambios significa que acepta el Descargo de responsabilidad actualizado.</p>

        <h2>12. Contacto</h2>
        <p>Para preguntas sobre este Descargo de responsabilidad: legal@levantemai.pro</p>
        <p>Para soporte general: support@levantemai.pro</p>

        <p className="mt-8 text-secondary">&copy; 2026 Levantem AI LTD. Todos los derechos reservados.</p>
      </div>
    );
  }

  if (locale === 'pt') {
    return (
      <div className="space-y-6 text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_p]:mb-4">
        <p className="text-secondary">
          Ao instalar, acessar ou utilizar o SirBro, você confirma que leu, compreendeu e concordou com todos os termos, políticas e condições descritos neste documento.
        </p>

        <h2>1. Não é uma Plataforma de Apostas ou Jogos de Azar</h2>
        <p>O SirBro é estritamente uma plataforma social gratuita de previsão esportiva e gamificação. Não oferecemos jogos de azar com dinheiro real, apostas esportivas ou loterias. Embora os usuários possam optar por comprar assinaturas opcionais de renovação automática para desbloquear recursos premium de software, aprimoramentos visuais estéticos e limites mais altos de engajamento diário, esses pagamentos são estritamente taxas de assinatura de software, não depósitos ou apostas.</p>
        <p>Os usuários não podem depositar moeda fiduciária para apostar em esportes, nem podem sacar ou resgatar a moeda do aplicativo (BP) ou itens virtuais por dinheiro real. Quaisquer referências a &quot;apoiar&quot;, &quot;picks&quot;, &quot;custos&quot;, &quot;recompensas&quot; ou &quot;mercados&quot; referem-se exclusivamente à economia simulada e gamificada dentro do aplicativo.</p>

        <h2>2. Não é uma Bolsa Financeira</h2>
        <p>O SirBro não é uma corretora registrada, bolsa financeira ou consultor de investimentos. As mecânicas de previsão ao vivo e os gráficos exibidos no aplicativo são recursos de entretenimento simulados, projetados para imitar a empolgação do momento esportivo ao vivo. Eles não representam mercados financeiros reais, e &quot;Picks&quot; não são valores mobiliários, commodities, opções ou instrumentos financeiros.</p>

        <h2>3. Não Afiliação da Plataforma</h2>
        <p>Apple Inc., Google LLC e Meta Platforms, Inc. não são patrocinadores, nem estão afiliados de forma alguma aos concursos, desafios de previsão ou mecânicas de gamificação fornecidos dentro do aplicativo SirBro.</p>

        <h2>4. Apenas para Entretenimento</h2>
        <p>Todas as previsões, insights, estatísticas e conteúdo gerado por IA fornecidos pelo SirBro são apenas para fins de informação e entretenimento. O SirBro não garante a precisão, integridade ou confiabilidade de nenhuma informação fornecida. Os usuários não devem confiar nessas informações para tomar decisões financeiras ou de apostas.</p>

        <h2>5. Conteúdo Gerado por IA</h2>
        <p>O conteúdo gerado por sistemas de IA pode ser impreciso, incompleto, desatualizado ou enganoso. Os modelos de IA são treinados com dados históricos e podem não refletir eventos ou condições atuais. Os usuários reconhecem que as previsões da IA são estimativas probabilísticas e não devem ser tratadas como fatos ou garantias.</p>

        <h2>6. Sem Aconselhamento Financeiro</h2>
        <p>O SirBro não fornece aconselhamento financeiro, de investimento ou de apostas. Nada no aplicativo deve ser interpretado como uma recomendação para fazer apostas ou tomar decisões financeiras. Os usuários são os únicos responsáveis por suas próprias decisões e ações.</p>

        <h2>7. Serviços de Terceiros</h2>
        <p>O SirBro pode exibir dados de fontes de terceiros (por exemplo, estatísticas esportivas, resultados de partidas). Não somos responsáveis pela precisão ou disponibilidade de dados de terceiros.</p>

        <h2>8. Responsabilidade do Usuário</h2>
        <p>Os usuários devem cumprir todas as leis aplicáveis em sua jurisdição. Se apostas ou jogos de azar forem ilegais na sua localidade, você não deve usar o SirBro para tais fins. Os usuários são responsáveis por compreender e seguir os regulamentos locais.</p>

        <h2>9. Restrição de Idade</h2>
        <p>O SirBro é destinado apenas a usuários com 18 anos ou mais. Ao usar o aplicativo, você confirma que atende a esse requisito de idade.</p>

        <h2>10. Limitação de Responsabilidade</h2>
        <p>A Levantem AI LTD não será responsável por quaisquer perdas, danos ou consequências decorrentes do uso do SirBro, incluindo, mas não se limitando a:</p>
        <ul>
          <li>Perdas financeiras por apostas ou jogos de azar;</li>
          <li>Previsões ou informações imprecisas;</li>
          <li>Interrupções de serviço ou problemas técnicos;</li>
          <li>Ações ou dados de terceiros.</li>
        </ul>

        <h2>11. Alterações neste Aviso Legal</h2>
        <p>Podemos atualizar este Aviso Legal a qualquer momento. O uso contínuo do aplicativo após as alterações significa que você aceita o Aviso Legal atualizado.</p>

        <h2>12. Contato</h2>
        <p>Para dúvidas sobre este Aviso Legal: legal@levantemai.pro</p>
        <p>Para suporte geral: support@levantemai.pro</p>

        <p className="mt-8 text-secondary">&copy; 2026 Levantem AI LTD. Todos os direitos reservados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_p]:mb-4">
      <p className="text-secondary">
        By installing, accessing, or using SirBro, you confirm that you have read, understood, and agreed to all the terms, policies, and conditions described in this document.
      </p>

      <h2>1. No Gambling or Betting Platform</h2>
      <p>Sirbro is strictly a free-to-play social sports prediction and gamification platform. We do not offer real-money gambling, sports betting, or lotteries. While users may choose to purchase optional auto-renewing subscriptions to unlock premium software features, cosmetic visual enhancements, and higher daily engagement limits, these payments are strictly software subscription fees, not deposits or wagers.</p>
      <p>Users cannot deposit fiat currency to wager on sports, nor can they withdraw or redeem in-app currency (BP) or virtual items for real money. Any references to &quot;backing&quot;, &quot;picks&quot;, &quot;costs&quot;, &quot;rewards&quot;, or &quot;markets&quot; refer exclusively to the simulated, gamified economy within the app.</p>

      <h2>2. Not a Financial Exchange</h2>
      <p>Sirbro is not a registered broker-dealer, financial exchange, or investment advisor. The live prediction mechanics and charts displayed in the app are simulated entertainment features designed to mimic the excitement of live sports momentum. They do not represent actual financial markets, and &quot;Picks&quot; are not securities, commodities, options, or financial instruments.</p>

      <h2>3. Platform Non-Affiliation</h2>
      <p>Apple Inc., Google LLC, and Meta Platforms, Inc. are not sponsors of, nor are they affiliated in any way with, the contests, prediction challenges, or gamification mechanics provided within the Sirbro app.</p>

      <h2>4. Entertainment Only</h2>
      <p>All predictions, insights, statistics, and AI-generated content provided by SirBro are for entertainment and informational purposes only. SirBro does not guarantee the accuracy, completeness, or reliability of any information provided. Users should not rely on this information for making financial or betting decisions.</p>

      <h2>5. AI-Generated Content</h2>
      <p>Content generated by AI systems may be inaccurate, incomplete, outdated, or misleading. AI models are trained on historical data and may not reflect current events or conditions. Users acknowledge that AI predictions are probabilistic estimates and should not be treated as facts or guarantees.</p>

      <h2>6. No Financial Advice</h2>
      <p>SirBro does not provide financial, investment, or betting advice. Nothing in the app should be construed as a recommendation to place bets or make financial decisions. Users are solely responsible for their own decisions and actions.</p>

      <h2>7. Third-Party Services</h2>
      <p>SirBro may display data from third-party sources (e.g., sports statistics, match results). We are not responsible for the accuracy or availability of third-party data.</p>

      <h2>8. User Responsibility</h2>
      <p>Users must comply with all applicable laws in their jurisdiction. If betting or gambling is illegal in your location, you must not use SirBro for such purposes. Users are responsible for understanding and following local regulations.</p>

      <h2>9. Age Restriction</h2>
      <p>SirBro is intended only for users aged 18 and older. By using the app, you confirm that you meet this age requirement.</p>

      <h2>10. Limitation of Liability</h2>
      <p>Levantem AI LTD shall not be liable for any losses, damages, or consequences arising from the use of SirBro, including but not limited to:</p>
      <ul>
        <li>Financial losses from betting or gambling;</li>
        <li>Inaccurate predictions or information;</li>
        <li>Service interruptions or technical issues;</li>
        <li>Third-party actions or data.</li>
      </ul>

      <h2>11. Changes to This Disclaimer</h2>
      <p>We may update this Disclaimer at any time. Continued use of the app after changes means you accept the updated Disclaimer.</p>

      <h2>12. Contact</h2>
      <p>For questions about this Disclaimer: legal@levantemai.pro</p>
      <p>For general support: support@levantemai.pro</p>

      <p className="mt-8 text-secondary">&copy; 2026 Levantem AI LTD. All rights reserved.</p>
    </div>
  );
}
