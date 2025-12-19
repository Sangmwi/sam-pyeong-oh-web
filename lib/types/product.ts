/**
 * PX 상품 타입
 */
export interface Product {
  id: string;
  /** 브랜드명 (예: "빙그레") */
  brand: string;
  /** 상품명 (예: "요플레 프로틴 맥스") */
  name: string;
  /** 상품 설명 (선택 사항) */
  description?: string;
  /** 가격 */
  price: number;
  /** 상품 이미지 URL */
  imageUrl?: string;
}
