import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'Agenda Acadêmica | Organização por Matérias',
  description: 'Organize provas, trabalhos e atividades da faculdade de forma colaborativa.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
