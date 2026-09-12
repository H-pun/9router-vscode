import * as vscode from 'vscode';

export const SECRET_KEY = '9router.apiKey';

export async function migrateApiKey(context: vscode.ExtensionContext): Promise<void> {
  const config = vscode.workspace.getConfiguration('9router');
  const inspected = config.inspect<string>('apiKey');

  const legacy =
    inspected?.workspaceFolderValue ||
    inspected?.workspaceValue ||
    inspected?.globalValue;

  if (!legacy || legacy.trim() === '') return;

  const existing = await context.secrets.get(SECRET_KEY);
  if (!existing) {
    await context.secrets.store(SECRET_KEY, legacy.trim());
  }

  for (const target of [
    vscode.ConfigurationTarget.Global,
    vscode.ConfigurationTarget.Workspace,
    vscode.ConfigurationTarget.WorkspaceFolder,
  ]) {
    try {
      await config.update('apiKey', undefined, target);
    } catch {
      // target tidak tersedia (mis. tidak ada workspace terbuka) — abaikan
    }
  }

  vscode.window.showInformationMessage(
    '9Router: API key dipindahkan ke penyimpanan aman VS Code dan dihapus dari settings.json.'
  );
}
