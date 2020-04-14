export default function(a, operator, b, options) {

    var result;

    switch (operator) {
        case '==':
            result = a == b;
            break;
        case '===':
            result = a === b;
            break;
        case '!=':
            result = a != b;
            break;
        case '!==':
            result = a !== b;
            break;
        case '<':
            result = a < b;
            break;
        case '>':
            result = a > b;
            break;
        case '<=':
            result = a <= b;
            break;
        case '>=':
            result = a >= b;
            break;
        case 'typeof':
            result = typeof a === b;
            break;
        default:
            {
                throw new Error('helper {{compare}}: invalid operator: `' + operator + '`');
            }
    }


    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

}