const fs = require('fs');

let content = fs.readFileSync('resources/js/pages/Administrasis/index.tsx', 'utf-8');

// We want to move <Tabs ...> to before the HEADER.
// And move the TabsList and Button inside the HEADER, and give them white text.

const tabsStart = '<Tabs defaultValue="dashboard" className="w-full" onValueChange={setActiveTab}>';
const headerStart = '{/* HEADER */}\n                <div className="relative overflow-hidden';
const tabsListAndButton = `                    <div className="flex flex-col xl:flex-row justify-between xl:items-center mb-6 mt-4 gap-4">\n                        <TabsList className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-1 rounded-lg overflow-x-auto flex-wrap h-auto justify-start">\n                            <TabsTrigger value="dashboard" className="rounded-md">Executive Dashboard</TabsTrigger>\n                            <TabsTrigger value="profit_loss" className="rounded-md">Laba Rugi (P&L)</TabsTrigger>\n                            <TabsTrigger value="neraca" className="rounded-md">Neraca Keuangan</TabsTrigger>\n                            <TabsTrigger value="cashflow" className="rounded-md">Arus Kas & Bank</TabsTrigger>\n                            <TabsTrigger value="expenses" className="rounded-md">Buku Jurnal</TabsTrigger>\n                        </TabsList>\n                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] rounded-lg px-5 h-9 font-medium border-0" onClick={openTransactionModal}>\n                            <PlusCircle className="w-4 h-4 mr-2" /> Jurnal Manual\n                        </Button>\n                    </div>`;

// 1. Remove TabsStart
content = content.replace(tabsStart + '\n', '');

// 2. Remove tabsListAndButton
content = content.replace(tabsListAndButton + '\n', '');

// 3. Put TabsStart before HEADER
content = content.replace(headerStart, tabsStart + '\n                ' + headerStart);

// 4. Put tabsListAndButton inside the end of HEADER
const headerEndPattern = `                        </div>\n                    </div>\n                </div>`;

const newTabsListAndButton = `                        </div>\n                        \n                        {/* TABS LIST INSIDE BANNER */}\n                        <div className="flex flex-col xl:flex-row justify-between xl:items-center mt-8 gap-4">\n                            <TabsList className="bg-white/10 dark:bg-zinc-900/50 backdrop-blur-md border border-white/20 dark:border-zinc-800 p-1 rounded-xl overflow-x-auto flex-wrap h-auto justify-start">\n                                <TabsTrigger value="dashboard" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 text-white">Executive Dashboard</TabsTrigger>\n                                <TabsTrigger value="profit_loss" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 text-white">Laba Rugi (P&L)</TabsTrigger>\n                                <TabsTrigger value="neraca" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 text-white">Neraca Keuangan</TabsTrigger>\n                                <TabsTrigger value="cashflow" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 text-white">Arus Kas & Bank</TabsTrigger>\n                                <TabsTrigger value="expenses" className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 text-white">Buku Jurnal</TabsTrigger>\n                            </TabsList>\n                            <Button className="bg-white hover:bg-slate-50 text-emerald-700 shadow-lg rounded-xl px-5 h-10 font-bold border-0" onClick={openTransactionModal}>\n                                <PlusCircle className="w-4 h-4 mr-2" /> Jurnal Manual\n                            </Button>\n                        </div>\n                    </div>\n                </div>`;

content = content.replace(headerEndPattern, newTabsListAndButton);

// Adjust banner padding to give room for tabs
content = content.replace('pb-32 pt-12', 'pb-40 pt-12');

fs.writeFileSync('resources/js/pages/Administrasis/index.tsx', content, 'utf-8');
console.log('Done rewriting Administrasis/index.tsx');
