import React, { useState } from 'react';
import { User } from '../types';

interface PasswordSetupProps {
  user: User;
  onSetup: (email: string, password: string) => void;
}

const termsOfUse = `TERMOS E CONDIÇÕES DE USO DO APLICATIVO "INFORT"
Data da Última Atualização: 24 de setembro de 2025

Prezado(a) Colaborador(a),

Seja bem-vindo(a) ao "InFort", o aplicativo de comunicação interna oficial da empresa Cledson Santana. Este aplicativo foi desenvolvido para facilitar nossa comunicação, agilizar processos e manter você sempre informado(a) sobre as novidades da nossa empresa.

Ao acessar e utilizar este aplicativo, você CONCORDA e se compromete a seguir os termos e condições descritos neste documento. A leitura completa e atenta deste termo é fundamental.

Cláusula 1ª - Do Objeto e Finalidade do Aplicativo
1.1. O aplicativo "InFort" é uma ferramenta corporativa de propriedade da Cledson Santana, destinada ao uso exclusivo de seus colaboradores ativos.

1.2. As principais finalidades do aplicativo são:
a) Comunicação Interna: Divulgação de comunicados oficiais, notícias, eventos, campanhas de endomarketing e informações relevantes sobre a empresa.
b) Acesso a Documentos de RH: Disponibilização de documentos de interesse do colaborador, em especial, a entrega mensal do contracheque (holerite).
c) Canal de Interação: Facilitar a comunicação entre o RH e os colaboradores, permitindo o envio de dúvidas e solicitações.
d) Treinamentos e Desenvolvimento: Disponibilização de materiais, vídeos e avisos sobre treinamentos.

Cláusula 2ª - Do Acesso e Uso da Conta
2.1. O acesso ao aplicativo é pessoal e intransferível, realizado através de matrícula e senha individual.

2.2. O colaborador é o único e exclusivo responsável por manter a confidencialidade de sua senha, não devendo compartilhá-la com terceiros.

2.3. Qualquer atividade realizada através da conta do colaborador será considerada de sua responsabilidade. A empresa não se responsabiliza pelo uso indevido da conta por terceiros.

2.4. Em caso de perda, roubo ou suspeita de uso não autorizado de sua conta, o colaborador deverá comunicar imediatamente o setor de RH.

Cláusula 3ª - Da Entrega do Contracheque (Holerite)
3.1. A disponibilização do contracheque mensal em formato digital, através deste aplicativo, substitui, para todos os fins legais, a entrega do documento físico.

3.2. Considera-se que o colaborador teve ciência e acesso ao seu contracheque a partir do momento em que o documento é disponibilizado na plataforma.

3.3. O colaborador declara, ao aceitar estes termos, que possui acesso regular a um dispositivo móvel (smartphone) com conexão à internet capaz de acessar o aplicativo e visualizar seus documentos.

3.4. Caso o colaborador não possua acesso a tal dispositivo ou encontre qualquer dificuldade técnica para visualizar seu contracheque, é sua responsabilidade procurar o setor de RH ou o seu gestor imediato para solicitar uma via impressa ou obter o suporte necessário.

3.5. A empresa garante a integridade e a segurança dos dados contidos nos documentos disponibilizados, em conformidade com a Lei Geral de Proteção de Dados (LGPD).

Cláusula 4ª - Das Obrigações e Condutas do Usuário
4.1. O colaborador se compromete a utilizar o aplicativo de forma ética e profissional, respeitando os valores da Cledson Santana.

4.2. É expressamente proibido:
a) Publicar ou compartilhar conteúdo ofensivo, discriminatório, difamatório, ilegal ou que viole a honra e a imagem de colegas, líderes, clientes ou da própria empresa.
b) Utilizar o aplicativo para fins pessoais, comerciais ou que não estejam alinhados com os objetivos corporativos.
c) Compartilhar informações confidenciais da empresa, como dados de vendas, estratégias comerciais, informações de outros colaboradores ou qualquer dado sensível ao qual tenha acesso.
d) Realizar qualquer ação que possa comprometer a segurança e o bom funcionamento do aplicativo (ex: tentativa de invasão, disseminação de vírus, etc.).

4.3. O descumprimento das regras de conduta descritas nesta cláusula poderá resultar em medidas disciplinares, conforme o regulamento interno e a Consolidação das Leis do Trabalho (CLT), incluindo advertência, suspensão e até mesmo a rescisão do contrato de trabalho por justa causa, sem prejuízo de eventuais ações cíveis e criminais.

Cláusula 5ª - Da Privacidade e Proteção de Dados (LGPD)
5.1. A Cledson Santana se compromete a tratar os dados pessoais dos colaboradores em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados).

5.2. Os dados coletados e tratados através do aplicativo têm a finalidade exclusiva de gestão da relação de trabalho e cumprimento de obrigações legais.

5.3. Para mais informações sobre como seus dados são tratados, consulte a nossa Política de Privacidade para Colaboradores, disponível no próprio aplicativo e nos canais de comunicação do RH.

Cláusula 6ª - Da Propriedade Intelectual
6.1. Todo o conteúdo disponibilizado no aplicativo, incluindo textos, imagens, vídeos, marcas e logotipos, é de propriedade exclusiva da Cledson Santana. É proibida a cópia, reprodução ou distribuição deste material sem autorização prévia e expressa da empresa.

Cláusula 7ª - Das Disposições Gerais
7.1. O acesso ao aplicativo poderá ser interrompido temporariamente para manutenções técnicas ou atualizações, sem aviso prévio.

7.2. O uso do aplicativo é facultativo, porém, a não utilização não isenta o colaborador da responsabilidade de se manter informado sobre os comunicados e documentos nele disponibilizados, especialmente o contracheque.

7.3. Estes Termos de Uso poderão ser atualizados a qualquer momento. A nova versão entrará em vigor na data de sua publicação no aplicativo, sendo o colaborador notificado sobre as alterações. A continuidade do uso do aplicativo após a atualização implicará na aceitação dos novos termos.

7.4. Este termo é parte integrante do contrato de trabalho e de outras políticas internas da empresa.

Cláusula 8ª - Do Foro
8.1. Fica eleito o foro da comarca onde o colaborador presta seus serviços para dirimir quaisquer controvérsias oriundas destes Termos de Uso.

Ao clicar em "Li e Aceito", o colaborador declara ter lido, compreendido e concordado com a integralidade dos Termos e Condições de Uso aqui estabelecidos.`;

const PasswordSetup: React.FC<PasswordSetupProps> = ({ user, onSetup }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!termsAccepted) {
      setError('Você deve aceitar os Termos e Condições de Uso para continuar.');
      return;
    }
    setError('');
    onSetup(user.email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 py-12">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Crie sua senha
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Bem-vindo(a), {user.name.split(' ')[0]}! Finalize seu cadastro.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">Nova Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 bg-white border border-slate-300 placeholder-slate-400 text-slate-800 rounded-t-md focus:outline-none focus:ring-slate-500 focus:border-slate-500 focus:z-10 sm:text-sm"
                placeholder="Nova Senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirmar Senha</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 bg-white border border-slate-300 placeholder-slate-400 text-slate-800 rounded-b-md focus:outline-none focus:ring-slate-500 focus:border-slate-500 focus:z-10 sm:text-sm"
                placeholder="Confirmar Senha"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="max-h-40 overflow-y-auto p-4 border border-slate-200 rounded-md bg-slate-50 text-xs text-slate-600">
                <pre className="whitespace-pre-wrap font-sans">{termsOfUse}</pre>
            </div>
            <div className="flex items-center">
                <input
                    id="terms-acceptance"
                    name="terms-acceptance"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                    className="h-4 w-4 text-slate-600 border-slate-300 rounded focus:ring-slate-500"
                />
                <label htmlFor="terms-acceptance" className="ml-2 block text-sm text-slate-900">
                    Eu li e aceito os Termos e Condições de Uso.
                </label>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={!termsAccepted}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              Definir Senha e Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordSetup;