/**********************************************************************
 *  Anatomia do Cavalo — backend de resultados (Google Apps Script)
 *
 *  O que faz: recebe cada resultado do teste (nome, turma, pontuação)
 *  e acrescenta uma linha a uma Google Sheet, carimbando a data/hora
 *  no fuso de Lisboa (Europe/Lisbon). Essa folha cresce a cada teste
 *  concluído e pode ser descarregada como CSV. A página de admin lê
 *  os dados a partir daqui.
 *
 *  COMO PÔR A FUNCIONAR
 *  1. Vai a https://sheets.new e cria uma folha nova (fica com ela aberta).
 *  2. Menu  Extensões ▸ Apps Script.  Apaga o que estiver lá e cola ISTO.
 *  3. Engrenagem (Definições do projeto) ▸ Propriedades do script ▸ adiciona:
 *       WRITE_KEY       = o mesmo valor de WRITE_KEY do index.html
 *       ADMIN_PASSWORD  = a palavra-passe do professor (só existe aqui,
 *                         nunca no código nem no GitHub)
 *  4. Clica em  Implementar ▸ Nova implementação.
 *       - Tipo (roda dentada):  Aplicação Web
 *       - Executar como:        Eu
 *       - Quem tem acesso:      Qualquer pessoa
 *     Autoriza quando pedir.
 *  5. Copia o URL que termina em  /exec  e cola-o em RESULTS_ENDPOINT
 *     no index.html E no admin.html.
 *  (Se mudares o código, faz  Implementar ▸ Gerir implementações ▸ Editar
 *   ▸ Nova versão, para o URL passar a usar a versão nova.)
 **********************************************************************/

// As chaves ficam nas Propriedades do script (passo 3), não no código.
const PROPS      = PropertiesService.getScriptProperties();
const SHEET_NAME = "Anatomia de um cavalo";
const TIMEZONE   = "Europe/Lisbon";      // fuso usado para carimbar a data/hora

function doGet(e){ return handle(e); }
function doPost(e){ return handle(e); }

function handle(e){
  const p = (e && e.parameter) || {};

  const reply = (obj) => {
    const json = JSON.stringify(obj);
    if (p.callback && /^[A-Za-z_$][\w$]{0,63}$/.test(p.callback)) {  // JSONP (usado pela página de admin)
      return ContentService.createTextOutput(p.callback + "(" + json + ")")
                           .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(json)
                         .setMimeType(ContentService.MimeType.JSON);
  };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(["name","class","score","total","percent","ok_pt_en","ok_en_pt","datetime"]);
  }

  // Ler todos os resultados (página de admin) — exige a palavra-passe do professor
  if (p.action === "list") {
    const adminPw = PROPS.getProperty("ADMIN_PASSWORD");
    if (!adminPw || p.pw !== adminPw) return reply({ ok:false, error:"bad password" });
    return reply({ ok:true, rows: sh.getDataRange().getValues() });
  }

  // Guardar um resultado novo (a data/hora é carimbada aqui, em hora de Lisboa)
  if (p.name) {
    const writeKey = PROPS.getProperty("WRITE_KEY");
    if (!writeKey || p.key !== writeKey) return reply({ ok:false, error:"bad key" });
    const now = Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd HH:mm:ss");
    sh.appendRow([
      String(p.name).slice(0, 60),
      String(p.cls || "").slice(0, 10),
      Number(p.score)   || 0,
      Number(p.total)   || 0,
      Number(p.percent) || 0,
      Number(p.okpe)    || 0,
      Number(p.okep)    || 0,
      now
    ]);
    return reply({ ok:true });
  }

  return reply({ ok:false, error:"noop" });
}
