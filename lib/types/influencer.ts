/**
 * 인플루언서 게시글 타입
 */
export interface Influencer {
  id: string;
  /** 작성자 아이디 */
  author: string;
  /** 게시글 제목 */
  title: string;
  /** 썸네일 이미지 URL */
  imageUrl?: string;
  /** 추천 수 */
  votes: number;
}
