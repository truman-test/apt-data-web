import { test, expect } from '@playwright/test';

test.describe('홈 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('페이지 타이틀 확인', async ({ page }) => {
    await expect(page).toHaveTitle(/아파트 실거래가/);
  });

  test('헤더와 네비게이션 표시', async ({ page }) => {
    // 로고 확인
    await expect(page.locator('a:has-text("아파트시세")')).toBeVisible();

    // 네비게이션 링크 확인
    await expect(page.locator('a:has-text("지도검색")')).toBeVisible();
    await expect(page.locator('a:has-text("관심단지")')).toBeVisible();
  });

  test('검색 입력창 표시', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="아파트"]');
    await expect(searchInput).toBeVisible();
  });

  test('검색 실행 시 검색 페이지로 이동', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="아파트"]');
    await searchInput.fill('래미안');
    await page.locator('button:has-text("검색")').click();

    // URL 인코딩된 한글 허용
    await expect(page).toHaveURL(/\/search\?q=/);
    expect(decodeURIComponent(page.url())).toContain('래미안');
  });

  test('빠른 지역 링크 클릭', async ({ page }) => {
    await page.locator('a:has-text("서울")').first().click();
    // URL 인코딩된 한글 허용
    await expect(page).toHaveURL(/\/search\?q=/);
    expect(decodeURIComponent(page.url())).toContain('서울');
  });

  test('지도검색 링크 이동', async ({ page }) => {
    await page.locator('a:has-text("지도검색")').click();
    await expect(page).toHaveURL('/map');
  });

  test('관심단지 링크 이동', async ({ page }) => {
    await page.locator('a:has-text("관심단지")').click();
    await expect(page).toHaveURL('/favorites');
  });
});
