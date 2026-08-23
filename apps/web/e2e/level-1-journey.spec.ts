import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const crewLeadId = '10000000-0000-4000-8000-000000000001';
const passengerId = '20000000-0000-4000-8000-000000000002';
test('Crew Lead and Passenger can enter their Level 1 workflows', async ({
  page,
}) => {
  const suffix = Date.now().toString().slice(-7);
  const passengerCode = `TEST-${suffix}`;
  const resourceCode = `LAB-${suffix}`;
  await page.goto('/');
  await page
    .getByRole('main')
    .getByRole('button', { name: 'Select identity' })
    .click();
  await page.getByLabel('Actor UUID').fill(crewLeadId);
  await page.getByRole('button', { name: 'Use identity' }).click();
  await page.getByRole('link', { name: 'Open' }).first().click();
  await expect(
    page.getByRole('heading', { name: 'Passenger management' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Create passenger' }).click();
  await page.getByLabel('Mission code').fill(passengerCode);
  await page.getByLabel('Full name').fill('Phase Three Traveller');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Passenger created.')).toBeVisible();
  await page.goto('/admin/resources');
  await page.getByRole('button', { name: 'Provision resource' }).click();
  await page.getByLabel('Resource code').fill(resourceCode);
  await page.getByLabel('Display name').fill('Phase Three Laboratory');
  await page.getByLabel('Minimum membership').click();
  await page.getByRole('option', { name: 'GOLD' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Resource provisioned.')).toBeVisible();
  await page.getByRole('button', { name: /Crew Lead/ }).click();
  await page.getByLabel('Actor type').click();
  await page.getByRole('option', { name: 'Passenger' }).click();
  await page.getByLabel('Actor UUID').fill(passengerId);
  await page.getByRole('button', { name: 'Use identity' }).click();
  await page.getByRole('link', { name: 'Open' }).click();
  await expect(
    page.getByRole('heading', { name: 'Discover resources' }),
  ).toBeVisible();
  await page.getByLabel('Search resources').fill(resourceCode);
  await expect(page.getByText('Phase Three Laboratory')).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
