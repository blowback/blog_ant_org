/* Prism language definition: MBASIC-80 (Microsoft BASIC-80 / CP/M).
 * Loosely models the custom Rouge lexer used on the old Jekyll blog.
 * Load AFTER prism core. Usage in posts: ```mbasic fenced code blocks.
 */
(function (Prism) {
  Prism.languages.mbasic = {
    // REM ...  and  ' ...  comments (to end of line)
    comment: {
      pattern: /(?:\bREM\b|').*/i,
      greedy: true,
    },

    // "strings" (BASIC has no escapes; doubled "" is a literal quote)
    string: {
      pattern: /"(?:[^"\r\n]|"")*"/,
      greedy: true,
    },

    // statement / function keywords (MBASIC-80 reserved words)
    keyword:
      /\b(?:AUTO|CALL|CHAIN|CLEAR|CLOSE|COMMON|CONT|DATA|DEF|DEFDBL|DEFINT|DEFSNG|DEFSTR|DELETE|DIM|EDIT|ELSE|END|ERASE|ERROR|FIELD|FILES|FOR|GET|GOSUB|GOTO|IF|INPUT|KILL|LET|LINE|LIST|LLIST|LOAD|LPRINT|LSET|MERGE|NAME|NEW|NEXT|NULL|ON|OPEN|OPTION|OUT|POKE|PRINT|PUT|RANDOMIZE|READ|REM|RENUM|RESTORE|RESUME|RETURN|RSET|RUN|SAVE|STEP|STOP|SWAP|THEN|TO|TRON|TROFF|USING|WAIT|WEND|WHILE|WIDTH|WRITE)\b/i,

    // built-in functions
    function:
      /\b(?:ABS|ASC|ATN|CDBL|CHR\$|CINT|COS|CSNG|CVD|CVI|CVS|EOF|EXP|FIX|FRE|HEX\$|INKEY\$|INP|INSTR|INT|LEFT\$|LEN|LOC|LOG|LPOS|MID\$|MKD\$|MKI\$|MKS\$|OCT\$|PEEK|POS|RIGHT\$|RND|SGN|SIN|SPACE\$|SPC|SQR|STR\$|STRING\$|TAB|TAN|USR|VAL|VARPTR)\b/i,

    // line numbers at start of line
    'line-number': {
      pattern: /^\s*\d+/m,
      alias: 'symbol',
    },

    // &Hxx hex, &Oxx octal, decimals, floats with type suffix (!#%)
    number:
      /(?:&[HO][\da-f]+|\b\d*\.?\d+(?:[ed][-+]?\d+)?[!#%]?)\b/i,

    // string vs numeric variables (foo$, n%, x!, d#)
    variable: /\b[A-Z][A-Z0-9]*[$%!#]?/i,

    operator: /<[=>]?|>=?|=|[-+*/^\\]|\b(?:AND|OR|NOT|XOR|EQV|IMP|MOD)\b/i,
    punctuation: /[(),;:]/,
  };
})(Prism);
