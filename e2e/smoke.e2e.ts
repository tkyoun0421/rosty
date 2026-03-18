describe('Bootstrap smoke test', () => {
  it('shows the workspace shell', async () => {
    await expect(element(by.text('Rosty'))).toBeVisible();
    await expect(element(by.text('Wedding hall operations cockpit'))).toBeVisible();
  });
});
