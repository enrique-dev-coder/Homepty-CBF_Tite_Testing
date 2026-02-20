// components/PageRenderer.tsx
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { COMPONENT_REGISTRY } from './registry';

interface PageRendererProps {
  page: {
    route: string;
    title: string;
    slots: Array<{
      slot_name: string;
      component_id: string;
      props: Record<string, any>;
    }>;
  };
  userId?: string;
  siteConfig?: {
    theme: {
      primary_color: string;
      secondary_color: string;
      font_family: string;
      logo?: string | null;
      banner?: string | null;
    };
    seo: {
      title: string;
      description: string;
      keywords: string[];
    };
  };
}

export function PageRenderer({ page, userId, siteConfig }: PageRendererProps) {
  return (
    <div className="flex flex-col gap-16">
      {page.slots.map((slot, index) => {
        const Component = COMPONENT_REGISTRY[slot.component_id];

        if (!Component) {
          return (
            <div key={index} className="text-red-500">
              Componente no encontrado: {slot.component_id}
            </div>
          );
        }

        return (
          <section key={index} className="container mx-auto">
            <Component 
              {...slot.props} 
              userId={userId}
              siteConfig={siteConfig}
            />
          </section>
        );
      })}
    </div>
  );
}
