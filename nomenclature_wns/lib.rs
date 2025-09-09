#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod nomenclature_wns {
    use ink::prelude::string::String;
    use ink::storage::Mapping;

    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum Error {
        NameAlreadyTaken,
        NameNotFound,
        NotOwner,
        InvalidName,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    #[ink(storage)]
    pub struct NomenclatureWns {
        /// Maps name to owner
        names: Mapping<String, AccountId>,
        /// Maps name to address
        addresses: Mapping<String, String>,
    }

    #[ink(event)]
    pub struct NameRegistered {
        #[ink(topic)]
        name: String,
        #[ink(topic)]
        owner: AccountId,
    }

    impl Default for NomenclatureWns {
        fn default() -> Self {
            Self::new()
        }
    }

    impl NomenclatureWns {
        /// Constructor
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                names: Mapping::default(),
                addresses: Mapping::default(),
            }
        }

        /// Register a new .web3 name
        #[ink(message)]
        pub fn register_name(&mut self, name: String, address: String) -> Result<()> {
            let caller = self.env().caller();

            // Basic validation
            if name.is_empty() || name.len() > 50 {
                return Err(Error::InvalidName);
            }

            // Check if name exists
            if self.names.contains(&name) {
                return Err(Error::NameAlreadyTaken);
            }

            // Store mappings
            self.names.insert(&name, &caller);
            self.addresses.insert(&name, &address);

            // Emit event
            self.env().emit_event(NameRegistered {
                name,
                owner: caller,
            });

            Ok(())
        }

        /// Update address for a name
        #[ink(message)]
        pub fn update_address(&mut self, name: String, address: String) -> Result<()> {
            let caller = self.env().caller();
            let owner = self.names.get(&name).ok_or(Error::NameNotFound)?;

            if owner != caller {
                return Err(Error::NotOwner);
            }

            self.addresses.insert(&name, &address);
            Ok(())
        }

        /// Resolve a name to address
        #[ink(message)]
        pub fn resolve_name(&self, name: String) -> Result<String> {
            self.addresses.get(&name).ok_or(Error::NameNotFound)
        }

        /// Get owner of a name
        #[ink(message)]
        pub fn get_owner(&self, name: String) -> Result<AccountId> {
            self.names.get(&name).ok_or(Error::NameNotFound)
        }

        /// Check if name is available
        #[ink(message)]
        pub fn is_name_available(&self, name: String) -> bool {
            !self.names.contains(&name)
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn register_works() {
            let mut contract = NomenclatureWns::new();
            let result = contract.register_name(
                "alice.web3".to_string(),
                "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty".to_string(),
            );
            assert!(result.is_ok());
        }

        #[ink::test]
        fn resolve_works() {
            let mut contract = NomenclatureWns::new();
            let address = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty".to_string();
            let _ = contract.register_name("alice.web3".to_string(), address.clone());
            let resolved = contract.resolve_name("alice.web3".to_string()).unwrap();
            assert_eq!(resolved, address);
        }
    }
}