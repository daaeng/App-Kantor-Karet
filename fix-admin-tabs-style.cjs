const fs = require('fs');

let content = fs.readFileSync('resources/js/pages/Administrasis/index.tsx', 'utf-8');

// 1. Change pb-40 back to pb-32
content = content.replace('pb-40 pt-12', 'pb-32 pt-12');

// 2. Revert TabsList to original style
const oldTabsList = `<TabsList className="bg-white/10 dark:bg-zinc-900/50 backdrop-blur-md border border-white/20 dark:border-zinc-800 p-1 rounded-xl overflow-x-auto flex-wrap h-auto justify-start">
                                <TabsTrigger value="dashboard" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 text-white">Executive Dashboard</TabsTrigger>
                                <TabsTrigger value="profit_loss" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 text-white">Laba Rugi (P&L)</TabsTrigger>
                                <TabsTrigger value="neraca" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 text-white">Neraca Keuangan</TabsTrigger>
                                <TabsTrigger value="cashflow" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 text-white">Arus Kas & Bank</TabsTrigger>
                                <TabsTrigger value="expenses" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 text-white">Buku Jurnal</TabsTrigger>
                            </TabsList>`;

const newTabsList = `<TabsList className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1 rounded-lg overflow-x-auto flex-wrap h-auto justify-start shadow-sm">
                                <TabsTrigger value="dashboard" className="rounded-md text-slate-600 data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-sm">Executive Dashboard</TabsTrigger>
                                <TabsTrigger value="profit_loss" className="rounded-md text-slate-600 data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-sm">Laba Rugi (P&L)</TabsTrigger>
                                <TabsTrigger value="neraca" className="rounded-md text-slate-600 data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-sm">Neraca Keuangan</TabsTrigger>
                                <TabsTrigger value="cashflow" className="rounded-md text-slate-600 data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-sm">Arus Kas & Bank</TabsTrigger>
                                <TabsTrigger value="expenses" className="rounded-md text-slate-600 data-[state=active]:bg-white data-[state=active]:text-sky-700 data-[state=active]:shadow-sm">Buku Jurnal</TabsTrigger>
                            </TabsList>`;

content = content.replace(oldTabsList, newTabsList);

// 3. Revert Button
const oldButton = `<Button className="bg-white hover:bg-slate-50 text-emerald-700 shadow-lg rounded-xl px-5 h-10 font-bold border-0" onClick={openTransactionModal}>
                                <PlusCircle className="w-4 h-4 mr-2" /> Jurnal Manual
                            </Button>`;
                            
const newButton = `<Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] rounded-lg px-5 h-9 font-medium border-0" onClick={openTransactionModal}>
                                <PlusCircle className="w-4 h-4 mr-2" /> Jurnal Manual
                            </Button>`;

content = content.replace(oldButton, newButton);

fs.writeFileSync('resources/js/pages/Administrasis/index.tsx', content, 'utf-8');
console.log('Reverted TabsList styling in Administrasis/index.tsx');
