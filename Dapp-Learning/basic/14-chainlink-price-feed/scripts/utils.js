const path = require('path');
const fs = require('fs');

const DEPLOYMENT_DIR = path.join(__dirname, '/deployment.json');

function readDeployment() {
    if (!fs.existsSync(DEPLOYMENT_DIR)) return null;
    try {
        return JSON.parse(fs.readFileSync(DEPLOYMENT_DIR, { encoding: 'utf-8' }));
    } catch {
        return null;
    }
}

function saveDeployment(payload) {
    let oldData = readDeployment();
    if (!oldData) oldData = {};
    fs.writeFileSync(
        DEPLOYMENT_DIR,
        JSON.stringify({
            ...oldData,
            ...payload,
        }),
        { flag: 'w+' }
    );
    return true;
}

module.exports = {
    readDeployment,
    saveDeployment,
};