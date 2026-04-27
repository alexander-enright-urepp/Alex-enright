import Foundation
import RevenueCat

// MARK: - RevenueCat Manager (Core Only)
class RevenueCatManager {
    static let shared = RevenueCatManager()
    
    // Product IDs - must match App Store Connect
    let productID = "com.alexenright.ios.premium"
    
    private init() {}
    
    // Initialize RevenueCat
    func configure() {
        Purchases.logLevel = .debug
        Purchases.configure(withAPIKey: "test_ierRkTqOisreaKFwCXKsAEMPfoz")
    }
    
    // Fetch product from App Store
    func fetchProduct(completion: @escaping (StoreProduct?) -> Void) {
        Purchases.shared.getProducts([productID]) { products in
            completion(products.first)
        }
    }
    
    // Purchase product
    func purchase(completion: @escaping (Bool, String?) -> Void) {
        fetchProduct { product in
            guard let product = product else {
                completion(false, "Product not found")
                return
            }
            
            Purchases.shared.purchase(product: product) { transaction, customerInfo, error, userCancelled in
                if userCancelled {
                    completion(false, "Purchase cancelled")
                    return
                }
                
                if let error = error {
                    completion(false, error.localizedDescription)
                    return
                }
                
                // Check if premium entitlement is active
                let isPremium = customerInfo?.entitlements["premium"]?.isActive == true
                completion(isPremium, nil)
            }
        }
    }
    
    // Restore purchases
    func restorePurchases(completion: @escaping (Bool, String?) -> Void) {
        Purchases.shared.restorePurchases { customerInfo, error in
            if let error = error {
                completion(false, error.localizedDescription)
                return
            }
            
            let isPremium = customerInfo?.entitlements["premium"]?.isActive == true
            completion(isPremium, nil)
        }
    }
    
    // Check purchase status
    func checkPurchaseStatus(completion: @escaping (Bool) -> Void) {
        Purchases.shared.getCustomerInfo { customerInfo, error in
            let isPremium = customerInfo?.entitlements["premium"]?.isActive == true
            completion(isPremium)
        }
    }
}
