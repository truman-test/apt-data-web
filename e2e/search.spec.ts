import { test, expect } from '@playwright/test';

test.describe('검색 페이지', () => {
  test('검색어 없이 접근 시 안내 메시지 표시', async ({ page }) => {
    await page.goto('/search');

    await expect(page.locator('text=검색어를 입력해주세요')).toBeVisible();
  });

  test('검색 결과 표시', async ({ page }) => {
    await page.goto('/search?q=래미안');

    // 결과 카드 확인 (로딩 완료 대기)
    await page.waitForSelector('[href^="/apt/"]', { timeout: 10000 });
    const cards = page.locator('[href^="/apt/"]');
    await expect(cards.first()).toBeVisible();

    // 검색 결과에 래미안이 포함된 항목이 있는지 확인
    await expect(page.getByText('래미안', { exact: false }).first()).toBeVisible();
  });

  test('검색 결과가 없을 때 메시지 표시', async ({ page }) => {
    await page.goto('/search?q=존재하지않는아파트명12345');

    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=검색 결과가 없습니다')).toBeVisible();
  });

  test('검색 결과에서 아파트 상세 페이지로 이동', async ({ page }) => {
    await page.goto('/search?q=래미안');

    // 첫 번째 결과 클릭 (force로 오버레이 무시)
    await page.waitForSelector('[href^="/apt/"]', { timeout: 10000 });
    await page.locator('[href^="/apt/"]').first().click({ force: true });

    // 상세 페이지로 이동 확인
    await expect(page).toHaveURL(/\/apt\/\d+/);
  });

  test('검색어 변경 시 새로운 검색 실행', async ({ page }) => {
    await page.goto('/search?q=래미안');

    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');

    // 검색어 변경
    const searchInput = page.locator('input[placeholder*="아파트"]');
    await searchInput.clear();
    await searchInput.fill('힐스테이트');

    // Enter 키로 검색 실행 (자동완성 드롭다운 무시)
    await searchInput.press('Enter');

    // URL이 힐스테이트로 변경될 때까지 대기
    await page.waitForURL(/\/search\?q=.*힐스테이트|%ED%9E%90%EC%8A%A4%ED%85%8C%EC%9D%B4%ED%8A%B8/, { timeout: 10000 });

    // URL 인코딩된 한글 허용
    await expect(page).toHaveURL(/\/search\?q=/);
    expect(decodeURIComponent(page.url())).toContain('힐스테이트');
  });

  test('뒤로가기 버튼 동작', async ({ page }) => {
    await page.goto('/search?q=래미안');

    await page.locator('a[href="/"]').click();
    await expect(page).toHaveURL('/');
  });
});
