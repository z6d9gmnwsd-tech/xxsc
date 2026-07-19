export async function compressImage(
  file: File,
  maxWidth: number = 1080,
  quality: number = 0.8
): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  if (width <= maxWidth) {
    bitmap.close();
    return file;
  }

  const scale = maxWidth / width;
  const targetWidth = maxWidth;
  const targetHeight = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  return new Promise<File>((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const ext = file.type === 'image/png' ? 'png' : 'jpg';
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, `.${ext}`),
            { type: `image/${ext}` }
          );
          resolve(compressedFile);
        } else {
          resolve(file);
        }
      },
      'image/jpeg',
      quality
    );
  });
}
