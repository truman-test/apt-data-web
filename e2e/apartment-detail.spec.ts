import { test, expect } from '@playwright/test';

test.describe('아파트 상세 페이지', () => {
  // 실제 존재하는 아파트 ID로 테스트 (검색을 통해 접근)
  test.beforeEach(async ({ page }) => {
    // 검색을 통해 아파트 상세 페이지로 이동
    await page.goto('/search?q=래미안');
    await page.waitForSelector('[href^="/apt/"]', { timeout: 10000 });
    await page.locator('[href^="/apt/"]').first().click();
    await page.waitForURL(/\/apt\/\d+/);
  });

  test('아파트 기본 정보 표시', async ({ page }) => {
    // 아파트 이름이 헤더에 표시되는지 확인
    await expect(page.locator('header h1')).toBeVisible();

    // 기본 정보 섹션 확인
    await expect(page.locator('text=단지 정보')).toBeVisible();
  });

  test('시세 차트 표시', async ({ page }) => {
    // 매매 시세 차트 확인
    await expect(page.locator('text=매매 시세')).toBeVisible();

    // 전월세 시세 차트 확인
    await expect(page.locator('text=전월세 시세')).toBeVisible();
  });

  test('평형 필터 표시 및 동작', async ({ page }) => {
    // 평형 선택 섹션 확인
    await expect(page.locator('text=평형 선택')).toBeVisible();

    // 전체 버튼 확인
    await expect(page.locator('button:has-text("전체")')).toBeVisible();
  });

  test('기간 선택 버튼 동작', async ({ page }) => {
    // 기간 선택 버튼들 확인
    await expect(page.locator('button:has-text("1년")')).toBeVisible();
    await expect(page.locator('button:has-text("3년")')).toBeVisible();
    await expect(page.locator('button:has-text("5년")')).toBeVisible();

    // 기간 변경
    await page.locator('button:has-text("5년")').first().click();

    // 버튼 활성화 상태 변경 확인 (bg-blue-600 클래스)
    await expect(page.locator('button:has-text("5년")').first()).toHaveClass(/bg-blue-600/);
  });

  test('즐겨찾기 버튼 동작', async ({ page }) => {
    // 즐겨찾기 버튼 클릭
    const favoriteButton = page.locator('header button[aria-label*="관심"]');
    await favoriteButton.click();

    // 토스트 메시지 확인
    await expect(page.locator('text=관심 목록에 추가되었습니다')).toBeVisible();

    // 다시 클릭하여 제거
    await favoriteButton.click();
    await expect(page.locator('text=관심 목록에서 제거되었습니다')).toBeVisible();
  });

  test('뒤로가기 버튼 동작', async ({ page }) => {
    const backButton = page.locator('header button').first();
    await backButton.click();

    // 이전 페이지로 이동
    await expect(page).toHaveURL(/\/search/);
  });

  test('거래 내역 표시', async ({ page }) => {
    // 거래 내역 섹션이 로드될 때까지 대기
    await page.waitForLoadState('networkidle');

    // 거래 내역이 있거나 "거래 내역이 없습니다" 메시지가 있는지 확인
    const hasTradeList = await page.locator('text=최근 거래').isVisible();
    const hasNoTrades = await page.locator('text=거래 내역이 없습니다').isVisible();

    expect(hasTradeList || hasNoTrades).toBeTruthy();
  });
});

test.describe('존재하지 않는 아파트', () => {
  test('에러 메시지 표시', async ({ page }) => {
    await page.goto('/apt/999999999');

    await expect(page.locator('text=아파트 정보를 찾을 수 없습니다')).toBeVisible();
  });
});
