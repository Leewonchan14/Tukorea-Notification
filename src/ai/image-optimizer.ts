import sharp from "sharp";
import fs from "fs";

export class ImageOptimizer {
  constructor(private readonly filePath: string) {}

  public async shouldOptimize() {
    const metadata = await sharp(this.filePath).metadata();
    const stat = await fs.promises.stat(this.filePath);

    const isTooBig = metadata.width > 1280 || metadata.height > 1280;
    const isLargeFile = stat.size > 1024 * 1024; // 1MB 이상
    const hasTooManyPixels = metadata.width * metadata.height > 1024 * 1024; // 약 1MP (토큰 효율적)

    return isTooBig || isLargeFile || hasTooManyPixels;
  }

  public async optimize() {
    let pipeline = sharp(this.filePath).resize(1280, 1280, {
      fit: "inside", // 비율 유지하며 크기 제한
      withoutEnlargement: true, // 작은 이미지는 확대하지 않음
    });

    // 2. 텍스트 인식을 위한 전처리
    pipeline = pipeline
      .sharpen() // 선명도 향상
      .normalise() // 대비 자동 조정
      .toColorspace("srgb"); // 색공간 표준화

    // 3. 저장 (품질 유지)
    const buffer = await pipeline
      .jpeg({
        quality: 90,
        progressive: true,
        optimizeScans: true,
      })
      .toBuffer();

    await fs.promises.writeFile(this.filePath, buffer);
  }
}
