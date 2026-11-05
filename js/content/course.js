/* Course assembly: module order. Codes are fixed in each module file (design R-2). */
PE.course = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M"].map(c => PE.content[c]).filter(Boolean);
