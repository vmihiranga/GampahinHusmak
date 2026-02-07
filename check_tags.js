
const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/admin.tsx', 'utf8');

const tags = content.match(/<(/?(?:Dialog|DialogContent|DialogHeader|DialogTitle|DialogDescription|DialogFooter|AlertDialog|AlertDialogContent|AlertDialogHeader|AlertDialogTitle|AlertDialogDescription|AlertDialogFooter|ScrollArea|Textarea|Button|Badge|Input|Label|Table|Select|Avatar|Link|div|section|aside|main|header|footer|Card|CardContent|CardHeader|CardTitle|CardDescription|Tabs|TabsContent|TabsList|TabsTrigger|TableBody|TableCell|TableHead|TableHeader|TableRow|SelectContent|SelectItem|SelectTrigger|SelectValue|AvatarFallback|AvatarImage|motion\.div|h1|h2|h3|p|span|b|i|u|br|hr|img))\b[^>]*>/g);

const stack = [];
tags.forEach(tag => {
    if (tag.endsWith('/>')) return;
    
    const match = tag.match(/<\/?([^\s>]+)/);
    if (!match) return;
    const name = match[1];
    
    if (tag.startsWith('</')) {
        if (stack.length === 0) {
            console.log(`Error: Found closing tag ${tag} with no opening tag.`);
            process.exit(1);
        }
        const lastOpen = stack.pop();
        if (lastOpen !== name) {
            console.log(`Error: Mismatched tags. Found ${tag} but expected </${lastOpen}>.`);
            process.exit(1);
        }
    } else {
        stack.push(name);
    }
});

if (stack.length > 0) {
    console.log(`Error: Unclosed tags: ${stack.join(', ')}`);
} else {
    console.log("All tags balanced!");
}
