import Image from "next/image";

interface ImageGalleryProps {
  images: string[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  if (images.length === 0) {
    return (
      <p className="text-xs text-zinc-400">
        No images available for this launch. Check the external links for more details.
      </p>
    );
  }

  return (
    <div className="flex snap-x gap-3 overflow-x-auto pb-2">
      {images.map((src, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <div
          key={src || index}
          className="relative h-40 w-64 shrink-0 snap-start overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/60"
        >
          <Image
            src={src}
            alt={`Launch image ${index + 1}`}
            fill
            className="object-cover"
            sizes="256px"
          />
        </div>
      ))}
    </div>
  );
}

