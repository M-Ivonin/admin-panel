import { Apple } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AppStoreButtons = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <Button
        size="lg"
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-6 text-base min-w-[200px] transition-all hover:scale-105"
        asChild
      >
        <a
          href="https://play.google.com/store/apps/details?id=ai.levantem.tipsterbro"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
          </svg>
          Google Play
        </a>
      </Button>

      <Button
        size="lg"
        className="bg-foreground hover:bg-foreground/90 text-background font-medium px-8 py-6 text-base min-w-[200px] transition-all hover:scale-105"
        asChild
      >
        <a
          href="https://apps.apple.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3"
        >
          <Apple className="w-6 h-6" />
          App Store
        </a>
      </Button>
    </div>
  );
};
