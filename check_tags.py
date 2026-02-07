
import re

def check_tags(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all JSX tags
    # This is a simplified regex and might have issues with strings/comments, 
    # but for standard component tags it should work.
    tags = re.findall(r'<(/?(?:Dialog|DialogContent|DialogHeader|DialogTitle|DialogDescription|DialogFooter|AlertDialog|AlertDialogContent|AlertDialogHeader|AlertDialogTitle|AlertDialogDescription|AlertDialogFooter|ScrollArea|Textarea|Button|Badge|Input|Label|Table|Select|Avatar|Link|div|section|aside|main|header|footer|Card|CardContent|CardHeader|CardTitle|CardDescription|Tabs|TabsContent|TabsList|TabsTrigger|TableBody|TableCell|TableHead|TableHeader|TableRow|SelectContent|SelectItem|SelectTrigger|SelectValue|AvatarFallback|AvatarImage|motion\.div|h1|h2|h3|p|span|b|i|u|br|hr|img|Avatar|AvatarFallback|AvatarImage|Button|Input|Label|Textarea|Badge|Card|CardContent|CardHeader|CardTitle|CardDescription|Dialog|DialogContent|DialogHeader|DialogTitle|DialogDescription|DialogFooter|ScrollArea|Tabs|TabsContent|TabsList|TabsTrigger|Table|TableBody|TableCell|TableHead|TableHeader|TableRow|Select|SelectContent|SelectItem|SelectTrigger|SelectValue))\b[^>]*>', content)

    stack = []
    for tag in tags:
        # Check if self-closing
        if tag.endswith('/>'):
            continue
        
        name = re.match(r'</?([^\s>]+)', tag).group(1)
        
        if tag.startswith('</'):
            if not stack:
                print(f"Error: Found closing tag {tag} with no opening tag.")
                return
            last_open = stack.pop()
            if last_open != name:
                print(f"Error: Mismatched tags. Found {tag} but expected </{last_open}>.")
                # print some context
                return
        else:
            stack.append(name)
    
    if stack:
        print(f"Error: Unclosed tags: {stack}")
    else:
        print("All tags balanced!")

check_tags('frontend/src/pages/admin.tsx')
