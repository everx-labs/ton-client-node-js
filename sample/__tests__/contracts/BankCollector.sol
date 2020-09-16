pragma solidity >=0.5.0;

// Interface to the bank client.
abstract contract IBankClient {
        function demandDebt(uint amount) public virtual;
        function setDebtAmount(uint amount) public virtual;
}

// Interface to the bank collector.
abstract contract IBankCollector {
        function receivePayment() public  virtual;
        function getDebtAmount() public virtual;
}


// The contract allows to store information about bank clients and iterate over them to filter clients.
contract BankCollector is IBankCollector {

	// Modifier that allows public function to accept all external calls.
	modifier onlyOwner {
        // Runtime functions to obtain message sender pubkey and contract pubkey.
		require(msg.pubkey() == tvm.pubkey());

		// Runtime function that allows contract to process inbound messages spending
		// its own resources (it's necessary if contract should process all inbound messages,
		// not only those that carry value with them).
		tvm.accept();
		_;
	}

	// Struct for storing the credit information.
	struct ClientInfo {
		uint debtAmount;
		uint32 expiredTimestamp;
	}

	// State variable storing client information.
	mapping(address => ClientInfo) clientDB;
        uint nextID;

        // Expiration period.
        uint32 constant EXPIRATION_PERIOD = 86400; // 1 day

        // Add client to database.
        function addClient(address addr, uint debtAmount) public onlyOwner {
                // Mapping member function to obtain value from mapping if it exists.
                optional(ClientInfo) info = clientDB.fetch(addr);
                if (info.hasValue()) {
                        ClientInfo i = info.get();
                        i.debtAmount += debtAmount;
                        clientDB[addr] = i;
                } else {
                        clientDB[addr] = ClientInfo(debtAmount, uint32(now) + EXPIRATION_PERIOD);
                }
        }

        // Function for client to get his debt amount.
        function getDebtAmount() public override {
                // Mapping member function to obtain value from mapping if it exists.
                optional(ClientInfo) info = clientDB.fetch(msg.sender);
                if (info.hasValue()) {
                        IBankClient(msg.sender).setDebtAmount(info.get().debtAmount);
                } else {
                        IBankClient(msg.sender).setDebtAmount(0);
                }
        }

        // Function for client to return debt.
        function receivePayment() public override {
                address addr = msg.sender;
                // Mapping member function to obtain value from mapping if it exists.
                optional(ClientInfo) info = clientDB.fetch(addr);
                if (info.hasValue()) {
                        ClientInfo i = info.get();
                        if (i.debtAmount <= msg.value) {
                                delete clientDB[addr];
                        } else {
                                i.debtAmount -= msg.value;
                                clientDB[addr] = i;
                        }
                }
        }

        // Function to demand all expired debts.
        function demandExpiredDebts() public view onlyOwner {
                uint32 curTime = uint32(now);
                // Mapping member function to obtain minimal key and associated value from mapping if it exists.
                optional(address, ClientInfo) client = clientDB.min(); 
                while(client.hasValue()) {
                        (address addr, ClientInfo info) = client.get();
                        if (info.expiredTimestamp <= curTime)
                                IBankClient(addr).demandDebt(info.debtAmount);
                        // Mapping member function to obtain next key and associated value from mapping if it exists.
                        client = clientDB.next(addr);
                }
        }

}