class User {
    constructor(id) {
        this.id = id;
        this.userName = null;
        this.firstName = null;
        this.lastName = null;
        this.middleName = null;
        this.workInfo = null;
        this.companyInfo = null;
        this.companyAdres = null;
        this.companyLabel = null;
        this.companyInn = null;
        this.telephone = null;
        this.city = null;
        this.aboutChannel = null;
        this.distributeName = null;
        this.state = null;
        this.registerComplete = false;
    }

    // dev : Clear user reg data
    Clear(){
        this.userName = null;
        this.firstName = null;
        this.lastName = null;
        this.middleName = null;
        this.workInfo = null;
        this.companyInfo = null;
        this.companyAdres = null;
        this.companyLabel = null;
        this.companyInn = null;
        this.telephone = null;
        this.city = null;
        this.aboutChannel = null;
        this.distributeName = null;
        this.state = 'start';
        this.registerComplete = false;
    }
}

module.exports = User;