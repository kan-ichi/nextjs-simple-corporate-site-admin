'use client';
import NextImage, { ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

interface Props extends ImageProps {
  src: string;
}

/**
 * 画像をFirebase Storageから読み込む
 * next/image コンポーネントを使用する際に、画像の width と height プロパティが必須となっているため、このコンポーネントを使用する
 * このコンポーネントを使用すると、画像の width と height プロパティを取得できる
 */
export default function ImageFirebaseStorage(props: Props) {
  const [dimensions, setDimensions] = useState<{ width: number | null; height: number | null }>({
    width: null,
    height: null,
  });

  useEffect(() => {
    const img = new Image();
    img.src = props.src;
    img.onload = () => {
      setDimensions({
        width: img.width,
        height: img.height,
      });
    };
  }, [props.src]);

  return dimensions.width && dimensions.height ? (
    <NextImage width={dimensions.width} height={dimensions.height} {...(props as ImageProps)} />
  ) : null;
}
