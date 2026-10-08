const crypto = require('crypto');
const { verifyPassword } = require('./_admin-auth');
async function redis(command) {
  if(!process.env.UPSTASH_REDIS_REST_URL||!process.env.UPSTASH_REDIS_REST_TOKEN)throw new Error('Úložiště není nastavené.');
  const response=await fetch(process.env.UPSTASH_REDIS_REST_URL,{method:'POST',headers:{Authorization:'Bearer '+process.env.UPSTASH_REDIS_REST_TOKEN,'Content-Type':'application/json'},body:JSON.stringify(command),cache:'no-store'});
  const body=await response.json();if(!response.ok||body.error)throw new Error(body.error||'Úložiště neodpovídá.');return body.result;
}
const PREFIX = 'karelulrych:courses:v1:';
const PROGRAMS = {
  astrology: { name:'Základní studium astrologie', price:5400, installments:8, capacity:10 },
  postgraduate: { name:'Postgraduální studium astrologie', price:4500, installments:12, approval:true },
  reiki12: { name:'Reiki 1. a 2. stupeň', price:1500, installments:1, capacity:7 },
  reiki3: { name:'Mistr Reiki terapeut', price:3500, installments:1, approval:true },
  reiki4: { name:'Mistr Reiki učitel', price:10000, installments:1, capacity:5, approval:true }
};
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const memberKey = (program,email) => PREFIX+'member:'+digest(program+':'+email);
async function read(key) { const value=await redis(['GET',key]); return value?JSON.parse(value):null; }
async function mail(to, subject, text) {
  if(!process.env.RESEND_API_KEY) throw new Error('E-mail není nastavený.');
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.ORDER_FROM_EMAIL||'Karel Ulrych <objednavky@karelulrych.cz>',to:[to],subject,text})});
  if(!response.ok) throw new Error('E-mail se nepodařilo odeslat.');
}
async function rate(req,action) {
  const ip=String(req.headers['x-forwarded-for']||'unknown').split(',')[0];
  return redis(['SET',PREFIX+'limit:'+action+':'+digest(ip),'1','NX','EX',30]);
}
module.exports=async (req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST') return res.status(405).json({error:'Použijte POST.'});
  const body=req.body||{};
  const action=String(body.action||'');
  const email=String(body.email||'').trim().toLowerCase();
  const program=String(body.program||'');
  const plan=PROGRAMS[program];
  try {
    if(['register','login'].includes(action)) {
      if(!plan||!/^\S+@\S+\.\S+$/.test(email)||email.length>254) return res.status(400).json({error:'Zkontrolujte program a e-mail.'});
      if(!await rate(req,action)) return res.status(429).json({error:'Počkejte prosím chvíli před dalším požadavkem.'});
    }
    if(action==='register') {
      const name=String(body.name||'').trim().slice(0,160);
      if(!name||body.terms!==true||(program.startsWith('reiki')&&body.adult!==true)) return res.status(400).json({error:'Vyplňte jméno a potvrďte podmínky.'});
      const key=memberKey(program,email);
      const member={key,email,name,program,status:plan.approval?'approval':'pending',payments:0,progress:0,reference:String(crypto.randomInt(100000000,1000000000)),createdAt:new Date().toISOString(),termsVersion:'2026-10-07'};
      const inserted=await redis(['SET',key,JSON.stringify(member),'NX']);
      if(inserted) await redis(['SADD',PREFIX+'members',key]);
      const saved=await read(key);
      // Only approved participants receive payment instructions. Capacity is confirmed by the owner before payment.
      try { await mail('ulrych.k@seznam.cz','Přihláška: '+plan.name,`${name}\n${email}\n${plan.name}\nStav: ${saved.status}\nVariabilní symbol: ${saved.reference}\nSpráva: https://www.karelulrych.cz/sprava-kurzu.html`); } catch { /* registration remains durable and visible in administration */ }
      return res.status(200).json({ok:true,status:saved.status,reference:saved.reference,price:plan.price,message:'Přihláška je uložená. Karel Ulrych ověří volné místo a pošle vám pokyny k platbě. Zatím prosím neplaťte.'});
    }
    if(action==='login') {
      const member=await read(memberKey(program,email));
      if(member&&['active','graduate'].includes(member.status)) {
        const token=crypto.randomBytes(32).toString('hex');
        await redis(['SETEX',PREFIX+'login:'+digest(token),900,member.key]);
        await mail(email,'Vstup do členské sekce',`Váš jednorázový odkaz platí 15 minut:\nhttps://www.karelulrych.cz/clenska-sekce.html?token=${token}\nPokud jste o přihlášení nežádali, e-mail ignorujte.`);
      }
      return res.status(200).json({ok:true,message:'Pokud je váš přístup aktivní, poslali jsme vám přihlašovací odkaz na e-mail.'});
    }
    if(action==='session') {
      if(!/^[a-f0-9]{64}$/.test(String(body.token||''))) return res.status(401).json({error:'Odkaz není platný.'});
      const key=await redis(['GETDEL',PREFIX+'login:'+digest(body.token)]);
      if(!key) return res.status(401).json({error:'Odkaz vypršel nebo už byl použitý. Vyžádejte si nový.'});
      const token=crypto.randomBytes(32).toString('hex');
      await redis(['SETEX',PREFIX+'session:'+digest(token),43200,key]);
      res.setHeader('Set-Cookie',`ku_member=${token}; HttpOnly; Secure; SameSite=Strict; Path=/api/courses; Max-Age=43200`);
      return res.status(200).json({ok:true});
    }
    if(action==='logout') { const token=String(req.headers.cookie||'').match(/(?:^|;\s*)ku_member=([a-f0-9]{64})/)?.[1]; if(token)await redis(['DEL',PREFIX+'session:'+digest(token)]); res.setHeader('Set-Cookie','ku_member=; HttpOnly; Secure; SameSite=Strict; Path=/api/courses; Max-Age=0');return res.status(200).json({ok:true}); }
    if(action==='content') {
      const token=String(req.headers.cookie||'').match(/(?:^|;\s*)ku_member=([a-f0-9]{64})/)?.[1];
      const key=token&&await redis(['GET',PREFIX+'session:'+digest(token)]);
      const member=key&&await read(key);
      if(!member||!['active','graduate'].includes(member.status))return res.status(401).json({error:'Přihlaste se pomocí odkazu zaslaného na e-mail.'});
      const lessons=await read(PREFIX+'lessons:'+member.program)||[];
      return res.status(200).json({member:{name:member.name,program:member.program,payments:member.payments,progress:member.progress,status:member.status},lessons:lessons.filter(x=>member.status==='graduate'||Number(x.level)<=member.progress)});
    }
    if(action.startsWith('admin-')) {
      const password=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
      if(!await verifyPassword(password))return res.status(401).json({error:'Nesprávné heslo administrace.'});
      if(action==='admin-list') {const keys=await redis(['SMEMBERS',PREFIX+'members']);const members=[];for(const key of keys||[]) {const m=await read(key);if(m)members.push(m);}return res.status(200).json({members,programs:PROGRAMS});}
      if(action==='admin-lessons') {if(!plan)return res.status(400).json({error:'Neplatný program.'});return res.status(200).json({lessons:await read(PREFIX+'lessons:'+program)||[]});}
      if(action==='admin-save-lessons') {
        if(!plan||!Array.isArray(body.lessons)||body.lessons.length>200)return res.status(400).json({error:'Neplatné materiály.'});
        const lessons=body.lessons.map(x=>({title:String(x.title||'').slice(0,200),text:String(x.text||'').slice(0,50000),level:Math.max(1,Math.min(200,Number(x.level)||1))}));
        await redis(['SET',PREFIX+'lessons:'+program,JSON.stringify(lessons)]);return res.status(200).json({ok:true});
      }
      if(action==='admin-update') {
        const key=String(body.key||'');
        if(!key.startsWith(PREFIX+'member:'))return res.status(400).json({error:'Neplatný člen.'});
        const member=await read(key);if(!member)return res.status(404).json({error:'Člen neexistuje.'});
        const p=PROGRAMS[member.program];
        const status=String(body.status||member.status);
        if(!['pending','approval','approved','waitlist','active','inactive','graduate'].includes(status))return res.status(400).json({error:'Neplatný stav.'});
        const payments=Number(body.payments);const progress=Number(body.progress);
        if(!Number.isInteger(payments)||payments<0||payments>p.installments||!Number.isInteger(progress)||progress<0||progress>200)return res.status(400).json({error:'Zkontrolujte počet plateb a postup.'});
        if(status==='active'&&payments<1)return res.status(400).json({error:'Aktivace vyžaduje potvrzení alespoň 1 platby.'});
        if(status==='graduate'&&payments!==p.installments)return res.status(400).json({error:'Zkontrolujte všechny platby před dokončením.'});
        const counted=['approved','active','graduate'].includes(status);
        const seats=PREFIX+'seats:'+member.program;
        if(counted&&p.capacity) {
          const script="if redis.call('SISMEMBER',KEYS[1],ARGV[1])==1 then return 1 end if redis.call('SCARD',KEYS[1])>=tonumber(ARGV[2]) then return 0 end redis.call('SADD',KEYS[1],ARGV[1]) return 1";
          if(!await redis(['EVAL',script,1,seats,key,p.capacity]))return res.status(409).json({error:'Kapacita je obsazená. Zařaďte přihlášku na čekací listinu.'});
        } else await redis(['SREM',seats,key]);
        const previous=member.status;
        Object.assign(member,{status,payments,progress,updatedAt:new Date().toISOString()});
        await redis(['SET',key,JSON.stringify(member)]);
        let emailSent=true;
        try {
          if(status==='approved'&&previous!=='approved')await mail(member.email,'Pokyny k platbě: '+p.name,`Dobrý den, vaše přihláška je schválená.\nProgram: ${p.name}\nČástka: ${p.price} Kč${p.installments>1?(member.program==='astrology'?' každé 3 měsíce, celkem ':' měsíčně, celkem ')+p.installments+' plateb':''}\nÚčet: 2003038329/2010\nVariabilní symbol: ${member.reference}\nPřístup aktivuji po potvrzení přijaté platby.\nKarel Ulrych`);
          if(status==='active'&&previous!=='active')await mail(member.email,'Členský přístup je aktivní',`Dobrý den, platbu jsem potvrdil a váš přístup je aktivní. Přihlásit se můžete zde:\nhttps://www.karelulrych.cz/clenska-sekce.html\nKarel Ulrych`);
        } catch {emailSent=false;}
        return res.status(200).json({ok:true,emailSent});
      }
    }
    return res.status(400).json({error:'Neplatný požadavek.'});
  } catch(error) {console.error('Courses request failed',error.message);return res.status(503).json({error:'Požadavek se nepodařilo dokončit. Zkuste to prosím později.'});}
};
