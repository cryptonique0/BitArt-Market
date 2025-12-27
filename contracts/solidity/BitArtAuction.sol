// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BitArtAuction
 * @dev Auction contract for NFTs with bidding and reserve prices
 */
contract BitArtAuction is Ownable, ReentrancyGuard {
    // Auction struct
    struct Auction {
        uint256 tokenId;
        address seller;
        uint256 currentBid;
        address highestBidder;
        uint256 reservePrice;
        uint256 startHeight;
        uint256 endHeight;
        bool isEnded;
        bool claimed;
    }

    // NFT contract interface
    interface IRoyaltyInfo {
        function royaltyInfo(uint256 tokenId, uint256 salePrice)
            external
            view
            returns (address receiver, uint256 royaltyAmount);

        function ownerOf(uint256 tokenId) external view returns (address);

        function transferFrom(
            address from,
            address to,
            uint256 tokenId
        ) external;
    }

    // Constants
    uint256 public constant MIN_BID_INCREMENT_PERCENTAGE = 100; // 1%
    uint256 public constant MIN_BID_INCREMENT_BASIS = 10000;

    // State variables
    IRoyaltyInfo public nftContract;
    uint256 public auctionCounter;
    uint256 public platformFeePercentage = 250; // 2.5% in basis points
    address public feeRecipient;
    mapping(address => bool) public admins;

    // Mappings
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => mapping(address => uint256)) public bids;
    mapping(address => uint256) public pendingBalances;

    // Events
    event AuctionCreated(
        uint256 indexed auctionId,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 reservePrice,
        uint256 endHeight
    );

    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );

    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 finalBid
    );

    event AuctionClaimed(
        uint256 indexed auctionId,
        address indexed seller,
        uint256 proceeds
    );

    event AuctionCanceled(uint256 indexed auctionId);
    event PlatformFeeUpdated(uint256 newFee);

    // Modifiers
    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor(address _nftContract) {
        nftContract = IRoyaltyInfo(_nftContract);
        feeRecipient = msg.sender;
        admins[msg.sender] = true;
    }

    /**
     * @dev Create a new auction
     * @param tokenId NFT token ID
     * @param reservePrice Minimum bid price
     * @param duration Auction duration in blocks
     */
    function createAuction(
        uint256 tokenId,
        uint256 reservePrice,
        uint256 duration
    ) public returns (uint256) {
        require(reservePrice > 0, "Invalid reserve price");
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not owner");

        uint256 auctionId = auctionCounter++;

        auctions[auctionId] = Auction({
            tokenId: tokenId,
            seller: msg.sender,
            currentBid: 0,
            highestBidder: address(0),
            reservePrice: reservePrice,
            startHeight: block.number,
            endHeight: block.number + duration,
            isEnded: false,
            claimed: false
        });

        emit AuctionCreated(auctionId, tokenId, msg.sender, reservePrice, block.number + duration);

        return auctionId;
    }

    /**
     * @dev Place a bid in an auction
     * @param auctionId Auction ID
     */
    function placeBid(uint256 auctionId) public payable nonReentrant {
        Auction storage auction = auctions[auctionId];

        require(!auction.isEnded, "Auction ended");
        require(block.number <= auction.endHeight, "Auction expired");
        require(msg.value > 0, "Invalid bid");

        uint256 totalBid = bids[auctionId][msg.sender] + msg.value;

        if (auction.currentBid > 0) {
            // Subsequent bids must exceed minimum increment
            uint256 minBid = auction.currentBid +
                ((auction.currentBid * MIN_BID_INCREMENT_PERCENTAGE) /
                    MIN_BID_INCREMENT_BASIS);
            require(totalBid >= minBid, "Bid too low");
        } else {
            // First bid must meet reserve
            require(totalBid >= auction.reservePrice, "Below reserve");
        }

        // Refund previous highest bidder
        if (auction.highestBidder != address(0)) {
            pendingBalances[auction.highestBidder] += auction.currentBid;
        }

        // Update auction state
        bids[auctionId][msg.sender] = totalBid;
        auction.currentBid = totalBid;
        auction.highestBidder = msg.sender;

        emit BidPlaced(auctionId, msg.sender, totalBid);
    }

    /**
     * @dev End auction (can be called by anyone after end time)
     * @param auctionId Auction ID
     */
    function endAuction(uint256 auctionId) public {
        Auction storage auction = auctions[auctionId];

        require(!auction.isEnded, "Already ended");
        require(block.number > auction.endHeight, "Auction still active");

        auction.isEnded = true;

        if (auction.highestBidder != address(0)) {
            emit AuctionEnded(auctionId, auction.highestBidder, auction.currentBid);
        }
    }

    /**
     * @dev Claim auction (seller claims proceeds, winner claims NFT)
     * @param auctionId Auction ID
     */
    function claimAuction(uint256 auctionId) public nonReentrant {
        Auction storage auction = auctions[auctionId];

        require(auction.isEnded, "Auction not ended");
        require(!auction.claimed, "Already claimed");
        require(
            msg.sender == auction.seller || msg.sender == auction.highestBidder,
            "Not authorized"
        );

        auction.claimed = true;

        if (msg.sender == auction.highestBidder && auction.currentBid >= auction.reservePrice) {
            // Winner claims NFT
            nftContract.transferFrom(auction.seller, msg.sender, auction.tokenId);
        } else if (msg.sender == auction.seller && auction.currentBid >= auction.reservePrice) {
            // Seller claims proceeds
            (address royaltyReceiver, uint256 royaltyAmount) = nftContract
                .royaltyInfo(auction.tokenId, auction.currentBid);
            uint256 platformFee = (auction.currentBid * platformFeePercentage) / 10000;
            uint256 sellerProceeds = auction.currentBid - royaltyAmount - platformFee;

            if (royaltyAmount > 0) {
                pendingBalances[royaltyReceiver] += royaltyAmount;
            }
            pendingBalances[feeRecipient] += platformFee;
            pendingBalances[auction.seller] += sellerProceeds;

            emit AuctionClaimed(auctionId, auction.seller, sellerProceeds);
        } else {
            revert("Cannot claim");
        }
    }

    /**
     * @dev Withdraw pending balance
     */
    function withdrawBalance() public nonReentrant {
        uint256 balance = pendingBalances[msg.sender];
        require(balance > 0, "No balance");

        pendingBalances[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Cancel auction (only if no bids yet)
     * @param auctionId Auction ID
     */
    function cancelAuction(uint256 auctionId) public {
        Auction storage auction = auctions[auctionId];

        require(auction.seller == msg.sender, "Not seller");
        require(auction.currentBid == 0, "Auction has bids");

        auction.isEnded = true;

        emit AuctionCanceled(auctionId);
    }

    /**
     * @dev Get auction information
     * @param auctionId Auction ID
     */
    function getAuction(uint256 auctionId)
        public
        view
        returns (Auction memory)
    {
        return auctions[auctionId];
    }

    /**
     * @dev Get user's bid in an auction
     * @param auctionId Auction ID
     * @param bidder Bidder address
     */
    function getUserBid(uint256 auctionId, address bidder)
        public
        view
        returns (uint256)
    {
        return bids[auctionId][bidder];
    }

    /**
     * @dev Update platform fee
     * @param newFee New fee in basis points
     */
    function setPlatformFee(uint256 newFee) public onlyAdmin {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFeePercentage = newFee;
        emit PlatformFeeUpdated(newFee);
    }

    /**
     * @dev Add admin address
     * @param admin Address to add as admin
     */
    function addAdmin(address admin) public onlyOwner {
        admins[admin] = true;
    }

    /**
     * @dev Remove admin address
     * @param admin Address to remove from admins
     */
    function removeAdmin(address admin) public onlyOwner {
        admins[admin] = false;
    }

    /**
     * @dev Get pending balance
     * @param account Account address
     */
    function getPendingBalance(address account) public view returns (uint256) {
        return pendingBalances[account];
    }
}
