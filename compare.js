const fs = require('fs');

const schema1Raw = fs.readFileSync('C:/Users/MuraliM/.gemini/antigravity/brain/cb56279e-c6a0-4f88-ba0d-18b25d092aba/.system_generated/steps/234/output.txt', 'utf8');
const schema2Raw = fs.readFileSync('C:/Users/MuraliM/.gemini/antigravity/brain/cb56279e-c6a0-4f88-ba0d-18b25d092aba/.system_generated/steps/235/output.txt', 'utf8');

const schema1 = JSON.parse(schema1Raw).tables;
const schema2 = JSON.parse(schema2Raw).tables;

const d1 = Object.fromEntries(schema1.map(t => [t.name, t]));
const d2 = Object.fromEntries(schema2.map(t => [t.name, t]));

const keys1 = new Set(Object.keys(d1));
const keys2 = new Set(Object.keys(d2));

console.log("=== TABLE DIFFERENCES ===");
const diff1 = [...keys1].filter(x => !keys2.has(x));
console.log("Tables in DTEAA not in muralineo:", diff1.length ? diff1 : "None");

const diff2 = [...keys2].filter(x => !keys1.has(x));
console.log("Tables in muralineo not in DTEAA:", diff2.length ? diff2 : "None");

console.log("\n=== COLUMN DIFFERENCES IN COMMON TABLES ===");
const commonTables = [...keys1].filter(x => keys2.has(x));

for (const t of commonTables) {
    const c1 = Object.fromEntries(d1[t].columns.map(c => [c.name, c]));
    const c2 = Object.fromEntries(d2[t].columns.map(c => [c.name, c]));
    
    const ckeys1 = new Set(Object.keys(c1));
    const ckeys2 = new Set(Object.keys(c2));
    
    const missingIn2 = [...ckeys1].filter(x => !ckeys2.has(x));
    const missingIn1 = [...ckeys2].filter(x => !ckeys1.has(x));
    
    if (missingIn2.length || missingIn1.length) {
        console.log(`Table ${t}:`);
        if (missingIn2.length) console.log(`  Missing in muralineo: ${missingIn2}`);
        if (missingIn1.length) console.log(`  Missing in DTEAA: ${missingIn1}`);
    }
    
    const commonCols = [...ckeys1].filter(x => ckeys2.has(x));
    for (const col of commonCols) {
        if (c1[col].data_type !== c2[col].data_type) {
            console.log(`  Table ${t} Column ${col} Type mismatch: DTEAA=${c1[col].data_type} vs muralineo=${c2[col].data_type}`);
        }
    }
}

console.log("\n=== FOREIGN KEY DIFFERENCES IN COMMON TABLES ===");
for (const t of commonTables) {
    const f1 = new Set((d1[t].foreign_key_constraints || []).map(f => f.name));
    const f2 = new Set((d2[t].foreign_key_constraints || []).map(f => f.name));
    
    const onlyIn1 = [...f1].filter(x => !f2.has(x));
    const onlyIn2 = [...f2].filter(x => !f1.has(x));
    
    if (onlyIn1.length || onlyIn2.length) {
        console.log(`Table ${t}:`);
        if (onlyIn1.length) console.log(`  FKs only in DTEAA: ${onlyIn1}`);
        if (onlyIn2.length) console.log(`  FKs only in muralineo: ${onlyIn2}`);
    }
}
