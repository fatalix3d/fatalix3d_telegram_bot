class User {
    constructor(id, firstName=null, secondName =null, thirdName =null,
                workInfo=null, companyInfo=null, companyInn = null,
                state=null, registerComplete = false) {

        this.id = id;
        this.firstName = firstName;
        this.secondName = secondName;
        this.thirdName =thirdName;
        this.workInfo = workInfo;
        this.companyInfo = companyInfo;
        this.companyInn = companyInn;
        this.state = state;
        this.registerComplete = registerComplete;
    }
}

module.exports = User;