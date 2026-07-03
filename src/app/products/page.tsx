// 통합 Products 목록은 제거(Commercial/Industrial 섹션으로 분리). 잔여 링크는 Commercial 로 이동.
import { redirect } from 'next/navigation';

export default function ProductsIndexRedirect() {
  redirect('/commercial');
}
