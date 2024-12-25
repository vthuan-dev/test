import { LazyLoadImage } from 'react-lazy-load-image-component';

import { images } from '~/app/assets/images';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface LoadingImageProps {
   src?: string;
   alt?: string;
   width?: string;
   height?: string;
   style?: Record<string, string | number>;
   placeholder?: string;
   className?: string;
}

export const LazyLoadingImage = (props: LoadingImageProps) => {
   const { src = images.noImage, alt, width = '100%', height = '100%', style, className } = props;

   return <LazyLoadImage className={className} src={src} alt={alt} width={width} height={height} style={style} />;
};
