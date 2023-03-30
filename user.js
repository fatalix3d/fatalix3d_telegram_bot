class User {
    constructor(id, userName=null, userId = null, firstName=null, secondName =null, thirdName =null,
                workInfo=null, companyInfo=null, companyInn = null,
                state=null, registerComplete = false) {

        this.id = id;
        this.userName = userName;
        this.userId = userId;
        this.firstName = firstName;
        this.secondName = secondName;
        this.thirdName =thirdName;
        this.workInfo = workInfo;
        this.companyInfo = companyInfo;
        this.companyInn = companyInn;
        this.state = state;
        this.registerComplete = registerComplete;
    }

    // dev : Clear user reg data
    Clear(){
        this.userName = null;
        this.userId = null;
        this.firstName = null;
        this.secondName = null;
        this.thirdName =null;
        this.workInfo = null;
        this.companyInfo = null;
        this.companyInn = null;
        this.state = 'start';
        this.registerComplete = false;
    }
}

module.exports = User;