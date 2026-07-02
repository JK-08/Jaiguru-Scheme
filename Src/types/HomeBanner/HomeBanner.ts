// Src/types/HomeBanner/HomeBanner.ts
//
// Onboarding banners (GET /schemebanner/all, Src/Services/OnboardService.js)
// and home/scheme sliders (GET /schemeslider/all,
// Src/Services/SliderService.js). Both return an { image_path } shape.

export interface OnboardBanner {
  BannerId?: number | string;
  image_path: string;
}

export interface SchemeSlider {
  image_path: string;
  [key: string]: unknown;
}

export interface OnboardBannerResponse {
  banners: OnboardBanner[];
}

export interface SchemeSliderResponse {
  sliders: SchemeSlider[];
}
