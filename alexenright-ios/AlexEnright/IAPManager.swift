import StoreKit
import SwiftUI

class IAPManager: NSObject, ObservableObject, SKPaymentTransactionObserver, SKProductsRequestDelegate {
    static let shared = IAPManager()
    
    @Published var products: [SKProduct] = []
    @Published var purchasedProductIDs: Set<String> = []
    @Published var isLoading = false
    @Published var purchaseError: String?
    
    // Your IAP Product ID from App Store Connect
    let productIDs: Set<String> = ["com.alexenright"]
    
    private var productsRequest: SKProductsRequest?
    private var completionHandler: ((Bool, String?) -> Void)?
    
    override init() {
        super.init()
        SKPaymentQueue.default().add(self)
        loadPurchasedProducts()
        fetchProducts()
    }
    
    deinit {
        SKPaymentQueue.default().remove(self)
    }
    
    // MARK: - Load Saved Purchases
    func loadPurchasedProducts() {
        for productID in productIDs {
            if UserDefaults.standard.bool(forKey: productID) {
                purchasedProductIDs.insert(productID)
            }
        }
    }
    
    func savePurchased(productID: String) {
        purchasedProductIDs.insert(productID)
        UserDefaults.standard.set(true, forKey: productID)
    }
    
    func isPurchased(productID: String) -> Bool {
        return purchasedProductIDs.contains(productID)
    }
    
    // MARK: - Fetch Products
    func fetchProducts() {
        guard !productIDs.isEmpty else { return }
        let request = SKProductsRequest(productIdentifiers: productIDs)
        request.delegate = self
        request.start()
        productsRequest = request
    }
    
    func productsRequest(_ request: SKProductsRequest, didReceive response: SKProductsResponse) {
        DispatchQueue.main.async {
            self.products = response.products
            if !response.invalidProductIdentifiers.isEmpty {
                print("Invalid product IDs: \(response.invalidProductIdentifiers)")
            }
        }
    }
    
    // MARK: - Purchase
    func purchase(product: SKProduct, completion: @escaping (Bool, String?) -> Void) {
        guard SKPaymentQueue.canMakePayments() else {
            completion(false, "In-app purchases are disabled")
            return
        }
        
        isLoading = true
        purchaseError = nil
        completionHandler = completion
        
        let payment = SKPayment(product: product)
        SKPaymentQueue.default().add(payment)
    }
    
    func purchaseProduct(withID productID: String, completion: @escaping (Bool, String?) -> Void) {
        guard let product = products.first(where: { $0.productIdentifier == productID }) else {
            completion(false, "Product not found")
            return
        }
        purchase(product: product, completion: completion)
    }
    
    // MARK: - Restore
    func restorePurchases(completion: @escaping (Bool, String?) -> Void) {
        isLoading = true
        completionHandler = completion
        SKPaymentQueue.default().restoreCompletedTransactions()
    }
    
    // MARK: - Transaction Observer
    func paymentQueue(_ queue: SKPaymentQueue, updatedTransactions transactions: [SKPaymentTransaction]) {
        for transaction in transactions {
            switch transaction.transactionState {
            case .purchased:
                complete(transaction: transaction)
            case .failed:
                fail(transaction: transaction)
            case .restored:
                restore(transaction: transaction)
            case .deferred, .purchasing:
                break
            @unknown default:
                break
            }
        }
    }
    
    func paymentQueue(_ queue: SKPaymentQueue, restoreCompletedTransactionsFailedWithError error: Error) {
        DispatchQueue.main.async {
            self.isLoading = false
            self.completionHandler?(false, error.localizedDescription)
            self.completionHandler = nil
        }
    }
    
    func paymentQueueRestoreCompletedTransactionsFinished(_ queue: SKPaymentQueue) {
        DispatchQueue.main.async {
            self.isLoading = false
            self.completionHandler?(true, nil)
            self.completionHandler = nil
        }
    }
    
    // MARK: - Transaction Handlers
    private func complete(transaction: SKPaymentTransaction) {
        savePurchased(productID: transaction.payment.productIdentifier)
        SKPaymentQueue.default().finishTransaction(transaction)
        
        DispatchQueue.main.async {
            self.isLoading = false
            self.completionHandler?(true, nil)
            self.completionHandler = nil
        }
    }
    
    private func fail(transaction: SKPaymentTransaction) {
        SKPaymentQueue.default().finishTransaction(transaction)
        
        DispatchQueue.main.async {
            self.isLoading = false
            let error = transaction.error?.localizedDescription ?? "Purchase failed"
            self.purchaseError = error
            self.completionHandler?(false, error)
            self.completionHandler = nil
        }
    }
    
    private func restore(transaction: SKPaymentTransaction) {
        savePurchased(productID: transaction.payment.productIdentifier)
        SKPaymentQueue.default().finishTransaction(transaction)
    }
}

// MARK: - Purchase View Model
class PurchaseViewModel: ObservableObject {
    @Published var isShowingPurchaseSheet = false
    @Published var isPurchased = false
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let iapManager = IAPManager.shared
    
    init() {
        checkPurchaseStatus()
    }
    
    func checkPurchaseStatus() {
        isPurchased = iapManager.isPurchased(productID: "com.alexenright")
    }
    
    func purchaseGames() {
        guard let product = iapManager.products.first else {
            errorMessage = "Product not available"
            return
        }
        
        isLoading = true
        iapManager.purchase(product: product) { [weak self] success, error in
            DispatchQueue.main.async {
                self?.isLoading = false
                if success {
                    self?.isPurchased = true
                    self?.isShowingPurchaseSheet = false
                } else if let error = error {
                    self?.errorMessage = error
                }
            }
        }
    }
    
    func restorePurchases() {
        isLoading = true
        iapManager.restorePurchases { [weak self] success, error in
            DispatchQueue.main.async {
                self?.isLoading = false
                self?.checkPurchaseStatus()
                if !success, let error = error {
                    self?.errorMessage = error
                }
            }
        }
    }
}
