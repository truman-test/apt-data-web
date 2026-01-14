import { test, expect } from '@playwright/test';

test.describe('검색 페이지', () => {
  test('검색어 없이 접근 시 안내 메시지 표시', async ({ page }) => {
    await page.goto('/search');

    await expect(page.locator('text=검색어를 입력해주세요')).toBeVisible();
  });

  test('검색 결과 표시', async ({ page }) => {
    await page.goto('/search?q=래미안');

    // 검색 결과 헤더 확인
    await expect(page.locator('text="래미안"')).toBeVisible();

    // 결과 카드 확인 (로딩 완료 대기)
    await page.waitForSelector('[href^="/apt/"]', { timeout: 10000 });
    const cards = page.locator('[href^="/apt/"]');
    await expect(cards.first()).toBeVisible();
  });

  test('검색 결과가 없을 때 메시지 표시', async ({ page }) => {
    await page.goto('/search?q=존재하지않는아파트명12345');

    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=검색 결과가 없습니다')).toBeVisible();
  });

  test('검색 결과에서 아파트 상세 페이지로 이동', async ({ page }) => {
    await page.goto('/search?q=래미안');

    // 첫 번째 결과 클릭
    await page.waitForSelector('[href^="/apt/"]', { timeout: 10000 });
    await page.locator('[href^="/apt/"]').first().click();

    // 상세 페이지로 이동 확인
    await expect(page).toHaveURL(/\/apt\/\d+/);
  });

  test('검색어 변경 시 새로운 검색 실행', async ({ page }) => {
    await page.goto('/search?q=래미안');

    // 검색어 변경
    const searchInput = page.locator('input[placeholder*="아파트"]');
    await searchInput.fill('힐스테이트');
    await page.locator('button:has-text("검색")').click();

    await expect(page).toHaveURL(/\/search\?q=힐스테이트/);
  });

  test('뒤로가기 버튼 동작', async ({ page }) => {
    await page.goto('/search?q=래미안');

    await page.locator('a[href="/"]').click();
    await expect(page).toHaveURL('/');
  });
});
