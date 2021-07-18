const crypto = required('crypto');

export const HasingString = ({string}) => {
    crypto.createHash('md5').update(string).digest('hex');
}