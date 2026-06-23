import type { PortfolioItem } from "../../data/portfolio";

type PortfolioCardProps = {
  item: PortfolioItem;
  className?: string;
  as?: "div" | "article" | "a";
  to?: string;
};

export function PortfolioCard({ item, className = "", as: Tag = "article" }: PortfolioCardProps) {
  return (
    <Tag
      className={`group relative aspect-[4/5] rounded-sm overflow-hidden bg-m7-charcoal ${className}`}
    >
      <img
        src={item.image}
        alt={`${item.title} — ${item.category}`}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      <div className={`absolute inset-0 bg-gradient-to-t ${item.gradient} via-black/60 to-transparent`} />
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-colors duration-500" />
      <div className="absolute inset-0 border border-m7-gold/0 group-hover:border-m7-gold/30 transition-colors duration-500 rounded-sm" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <p className="text-m7-gold text-xs tracking-widest uppercase">{item.category}</p>
        <h3 className="font-display text-2xl md:text-3xl text-white mt-1">{item.title}</h3>
        <p className="text-m7-muted text-sm mt-2">{item.client} · {item.year}</p>
        <p className="text-white/70 text-sm mt-3 leading-relaxed opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-24 transition-all duration-300 overflow-hidden">
          {item.description}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] tracking-wider uppercase px-2 py-1 border border-m7-gold/30 text-m7-gold-light rounded-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Tag>
  );
}
