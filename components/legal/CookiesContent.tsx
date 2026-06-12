import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Locale } from '@/lib/i18n/config';

type CookiesContentProps = {
  locale?: Locale;
};

export function CookiesContent({ locale = 'en' }: CookiesContentProps) {
  if (locale === 'es') {
    return (
      <Box sx={{ '& > *': { mb: 3 } }}>
        <Typography color="text.secondary">
          Al instalar, acceder o utilizar SirBro, confirma que ha leído, comprendido y aceptado todos los términos, políticas y condiciones descritos en este documento.
        </Typography>

        <Typography variant="h5" component="h2" fontWeight={700} sx={{ mt: 4, mb: 2 }}>
          1. Qué son las cookies y las tecnologías de rastreo
        </Typography>
        <Typography>
          Las cookies son pequeños archivos de texto almacenados en su dispositivo para ayudar a mejorar su experiencia. Además de las cookies, SirBro utiliza SDKs (Kits de Desarrollo de Software) móviles, almacenamiento local y WebSockets para recopilar información sobre cómo utiliza nuestra aplicación y para garantizar que nuestras funciones de gamificación en tiempo real funcionen correctamente.
        </Typography>

        <Typography variant="h5" component="h2" fontWeight={700} sx={{ mt: 4, mb: 2 }}>
          2. Cómo utilizamos las cookies
        </Typography>
        <Typography>Utilizamos tecnologías de rastreo para los siguientes propósitos:</Typography>
        <Box component="ul" sx={{ pl: 4, '& li': { mb: 1 } }}>
          <li>Cookies esenciales para la funcionalidad de la aplicación y la seguridad de la cuenta.</li>
          <li>Cookies analíticas para comprender los patrones de uso y mejorar la aplicación.</li>
          <li>Cookies de preferencia para recordar su configuración y cosméticos personalizados.</li>
          <li>
            Seguimiento de sesiones y rendimiento en tiempo real: Utilizamos almacenamiento local estrictamente necesario y tecnologías de seguimiento de sesiones durante eventos deportivos en vivo. Estas herramientas son necesarias para mantener conexiones WebSocket seguras y en tiempo real entre su dispositivo y nuestras fuentes de datos deportivos en vivo. Esto garantiza que los &quot;Picks&quot; y los saldos de BP se actualicen sincrónicamente con los eventos de los partidos en vivo, y ayuda a nuestros sistemas automatizados a detectar y prevenir la explotación de latencia o el abuso de la red durante interacciones de alta frecuencia.
          </li>
        </Box>

        <Typography variant="h5" component="h2" fontWeight={700} sx={{ mt: 4, mb: 2 }}>
          3. Gestión de cookies
        </Typography>
        <Typography>
          Puede controlar las cookies y los permisos de seguimiento de la aplicación a través de la configuración de su dispositivo (por ejemplo, la configuración de Privacidad y Seguridad en iOS, o la configuración de Privacidad en Android).
        </Typography>
        <Typography>
          Tenga en cuenta que deshabilitar las tecnologías de seguimiento estrictamente necesarias, el almacenamiento local o los WebSockets afectará gravemente su capacidad para usar la aplicación, y es posible que no pueda participar en mercados de predicción en vivo o chats comunitarios.
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 4 }}>
          &copy; 2026 Levantem AI LTD. Todos los derechos reservados.
        </Typography>
      </Box>
    );
  }

  if (locale === 'pt') {
    return (
      <Box sx={{ '& > *': { mb: 3 } }}>
        <Typography color="text.secondary">
          Ao instalar, acessar ou utilizar o SirBro, você confirma que leu, compreendeu e concordou com todos os termos, políticas e condições descritos neste documento.
        </Typography>

        <Typography variant="h5" component="h2" fontWeight={700} sx={{ mt: 4, mb: 2 }}>
          1. O Que São Cookies e Tecnologias de Rastreamento
        </Typography>
        <Typography>
          Cookies são pequenos arquivos de texto armazenados no seu dispositivo para ajudar a melhorar a sua experiência. Além dos cookies, o SirBro utiliza SDKs (Kits de Desenvolvimento de Software) móveis, armazenamento local e WebSockets para coletar informações sobre como você usa nosso aplicativo e para garantir que nossos recursos de gamificação em tempo real funcionem corretamente.
        </Typography>

        <Typography variant="h5" component="h2" fontWeight={700} sx={{ mt: 4, mb: 2 }}>
          2. Como Usamos os Cookies
        </Typography>
        <Typography>Usamos tecnologias de rastreamento para os seguintes propósitos:</Typography>
        <Box component="ul" sx={{ pl: 4, '& li': { mb: 1 } }}>
          <li>Cookies essenciais para a funcionalidade do aplicativo e segurança da conta.</li>
          <li>Cookies analíticos para entender padrões de uso e melhorar o aplicativo.</li>
          <li>Cookies de preferência para lembrar de suas configurações e cosméticos personalizados.</li>
          <li>
            Rastreamento de Sessão e Desempenho em Tempo Real: Utilizamos tecnologias de armazenamento local e rastreamento de sessão estritamente necessárias durante eventos esportivos ao vivo. Essas ferramentas são necessárias para manter conexões WebSocket seguras e em tempo real entre o seu dispositivo e nossos feeds de dados esportivos ao vivo. Isso garante que os &quot;Picks&quot; e os saldos de BP sejam atualizados sincronamente com os eventos da partida ao vivo, e ajuda nossos sistemas automatizados a detectar e prevenir a exploração de latência ou abuso de rede durante interações de alta frequência.
          </li>
        </Box>

        <Typography variant="h5" component="h2" fontWeight={700} sx={{ mt: 4, mb: 2 }}>
          3. Gerenciamento de Cookies
        </Typography>
        <Typography>
          Você pode controlar os cookies e as permissões de rastreamento do aplicativo através das configurações do seu dispositivo (por exemplo, configurações de Privacidade e Segurança do iOS ou configurações de Privacidade do Android).
        </Typography>
        <Typography>
          Observe que desativar as tecnologias de rastreamento estritamente necessárias, armazenamento local ou WebSockets afetará gravemente a sua capacidade de usar o aplicativo e você poderá não conseguir participar de mercados de previsão ao vivo ou chats comunitários.
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 4 }}>
          &copy; 2026 Levantem AI LTD. Todos os direitos reservados.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ '& > *': { mb: 3 } }}>
      <Typography color="text.secondary">
        By installing, accessing, or using SirBro, you confirm that you have read, understood, and agreed to all the terms, policies, and conditions described in this document.
      </Typography>

      <Typography variant="h5" component="h2" fontWeight={700} sx={{ mt: 4, mb: 2 }}>
        1. What Are Cookies and Tracking Technologies
      </Typography>
      <Typography>
        Cookies are small text files stored on your device to help improve your experience. In addition to cookies, SirBro utilizes mobile SDKs (Software Development Kits), local storage, and WebSockets to collect information about how you use our app and to ensure our real-time gamification features function correctly.
      </Typography>

      <Typography variant="h5" component="h2" fontWeight={700} sx={{ mt: 4, mb: 2 }}>
        2. How We Use Cookies
      </Typography>
      <Typography>We use tracking technologies for the following purposes:</Typography>
      <Box component="ul" sx={{ pl: 4, '& li': { mb: 1 } }}>
        <li>Essential cookies for app functionality and account security.</li>
        <li>Analytics cookies to understand usage patterns and improve the app.</li>
        <li>Preference cookies to remember your settings and customized cosmetics.</li>
        <li>
          Real-Time Session and Performance Tracking: We utilize strictly necessary local storage and session tracking technologies during live sporting events. These tools are required to maintain secure, real-time WebSocket connections between your device and our live sports data feeds. This ensures that &quot;Picks&quot; and BP balances update synchronously with live match events, and helps our automated systems detect and prevent latency exploitation or network abuse during high-frequency engagements.
        </li>
      </Box>

      <Typography variant="h5" component="h2" fontWeight={700} sx={{ mt: 4, mb: 2 }}>
        3. Managing Cookies
      </Typography>
      <Typography>
        You can control cookies and app tracking permissions through your device settings (e.g., iOS Privacy &amp; Security settings, or Android Privacy settings).
      </Typography>
      <Typography>
        Please note that disabling strictly necessary tracking technologies, local storage, or WebSockets will severely impact your ability to use the app, and you may not be able to participate in live prediction markets or community chats.
      </Typography>

      <Typography color="text.secondary" sx={{ mt: 4 }}>
        &copy; 2026 Levantem AI LTD. All rights reserved.
      </Typography>
    </Box>
  );
}
