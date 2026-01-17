;; BitArt Market - GovDAO Contract
;; Governance DAO with voting power based on user criteria
;; Voting power determined by: NFT holdings, XP level, follower count, and achievement tiers

;; ============================================
;; CONSTANTS
;; ============================================
(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-UNAUTHORIZED u401)
(define-constant ERR-NOT-FOUND u404)
(define-constant ERR-INVALID-INPUT u400)
(define-constant ERR-INSUFFICIENT-VOTING-POWER u402)
(define-constant ERR-PROPOSAL-CLOSED u403)
(define-constant ERR-ALREADY-VOTED u404)
(define-constant ERR-INVALID-PROPOSAL u405)
(define-constant ERR-VOTING-NOT-STARTED u406)
(define-constant ERR-VOTING-NOT-ENDED u407)

;; Voting power criteria weights (out of 1000)
(define-constant NFT-HOLDING-WEIGHT u400)    ;; 40% - 1 vote per NFT
(define-constant XP-LEVEL-WEIGHT u300)       ;; 30% - 1 vote per 10 levels
(define-constant FOLLOWER-WEIGHT u200)       ;; 20% - 1 vote per 100 followers
(define-constant ACHIEVEMENT-WEIGHT u100)    ;; 10% - 1 vote per 5 epic achievements

;; Minimum voting power required to create a proposal
(define-constant MIN-VOTING-POWER-FOR-PROPOSAL u10)

;; Governance parameters
(define-data-var min-voting-period u2880)    ;; ~24 hours in blocks (6 blocks/min)
(define-data-var max-voting-period u20160)   ;; ~1 week in blocks
(define-data-var quorum-percentage u20)      ;; 20% of total voting power must participate
(define-data-var execution-delay u1440)      ;; ~10 hours delay after vote ends

;; ============================================
;; DATA STRUCTURES
;; ============================================

;; Governance Token Holder Voting Power
(define-map voter-power
  { voter: principal }
  {
    total-voting-power: uint,
    nft-holdings: uint,
    xp-level: uint,
    followers: uint,
    epic-achievements: uint,
    last-updated: uint
  }
)

;; Proposals
(define-map proposals
  { proposal-id: uint }
  {
    proposer: principal,
    title: (string-ascii 100),
    description: (string-utf8 500),
    proposal-type: (string-ascii 30), ;; "parameter-change" | "fund-allocation" | "feature-request"
    votes-for: uint,
    votes-against: uint,
    abstained: uint,
    start-block: uint,
    end-block: uint,
    status: (string-ascii 20), ;; "active" | "passed" | "failed" | "executed" | "cancelled"
    execution-data: (string-utf8 1000),
    created-at: uint
  }
)

;; Track voter participation
(define-map proposal-votes
  { proposal-id: uint, voter: principal }
  {
    vote-choice: (string-ascii 20), ;; "for" | "against" | "abstain"
    voting-power-used: uint,
    voted-at: uint
  }
)

;; Voting power snapshot at proposal creation
(define-map proposal-voting-power-snapshot
  { proposal-id: uint, voter: principal }
  { voting-power: uint }
)

;; Proposal counter
(define-data-var proposal-counter uint u0)

;; ============================================
;; VOTING POWER CALCULATION
;; ============================================

;; Calculate total voting power based on criteria
(define-public (calculate-voting-power
  (voter principal)
  (nft-count uint)
  (xp-level uint)
  (follower-count uint)
  (epic-achievement-count uint)
)
  (let (
    (nft-votes (/ (* nft-count NFT-HOLDING-WEIGHT) u1000))
    (xp-votes (/ (* (/ xp-level u10) XP-LEVEL-WEIGHT) u1000))
    (follower-votes (/ (* (/ follower-count u100) FOLLOWER-WEIGHT) u1000))
    (achievement-votes (/ (* (/ epic-achievement-count u5) ACHIEVEMENT-WEIGHT) u1000))
    (total-power (+ nft-votes (+ xp-votes (+ follower-votes achievement-votes))))
  )
    (ok total-power)
  )
)

;; Update voter's voting power (called by backend after data verification)
(define-public (update-voter-power
  (voter principal)
  (nft-holdings uint)
  (xp-level uint)
  (follower-count uint)
  (epic-achievements uint)
)
  (begin
    ;; Only contract owner can update voter power
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-UNAUTHORIZED))
    
    (let (
      (nft-votes (/ (* nft-holdings NFT-HOLDING-WEIGHT) u1000))
      (xp-votes (/ (* (/ xp-level u10) XP-LEVEL-WEIGHT) u1000))
      (follower-votes (/ (* (/ follower-count u100) FOLLOWER-WEIGHT) u1000))
      (achievement-votes (/ (* (/ epic-achievements u5) ACHIEVEMENT-WEIGHT) u1000))
      (total-power (+ nft-votes (+ xp-votes (+ follower-votes achievement-votes))))
    )
      (map-set voter-power
        { voter: voter }
        {
          total-voting-power: total-power,
          nft-holdings: nft-holdings,
          xp-level: xp-level,
          followers: follower-count,
          epic-achievements: epic-achievements,
          last-updated: block-height
        }
      )
      (ok total-power)
    )
  )
)

;; Get voter's current voting power
(define-read-only (get-voter-power (voter principal))
  (let (
    (power-data (map-get? voter-power { voter: voter }))
  )
    (if (is-some power-data)
      (ok (get total-voting-power (unwrap! power-data (err ERR-NOT-FOUND))))
      (ok u0)
    )
  )
)

;; ============================================
;; PROPOSAL MANAGEMENT
;; ============================================

;; Create a new proposal
(define-public (create-proposal
  (title (string-ascii 100))
  (description (string-utf8 500))
  (proposal-type (string-ascii 30))
  (voting-period uint)
  (execution-data (string-utf8 1000))
)
  (let (
    (proposer-power (unwrap! (get-voter-power tx-sender) (err ERR-NOT-FOUND)))
    (new-proposal-id (+ (var-get proposal-counter) u1))
    (start-block block-height)
    (end-block (+ block-height voting-period))
  )
    ;; Check voting period is valid
    (asserts! (>= voting-period (var-get min-voting-period)) (err ERR-INVALID-INPUT))
    (asserts! (<= voting-period (var-get max-voting-period)) (err ERR-INVALID-INPUT))
    
    ;; Check proposer has sufficient voting power
    (asserts! (>= proposer-power MIN-VOTING-POWER-FOR-PROPOSAL) (err ERR-INSUFFICIENT-VOTING-POWER))
    
    ;; Create proposal
    (map-insert proposals
      { proposal-id: new-proposal-id }
      {
        proposer: tx-sender,
        title: title,
        description: description,
        proposal-type: proposal-type,
        votes-for: u0,
        votes-against: u0,
        abstained: u0,
        start-block: start-block,
        end-block: end-block,
        status: "active",
        execution-data: execution-data,
        created-at: block-height
      }
    )
    
    ;; Update counter
    (var-set proposal-counter new-proposal-id)
    
    (ok new-proposal-id)
  )
)

;; Cast vote on a proposal
(define-public (vote-on-proposal
  (proposal-id uint)
  (vote-choice (string-ascii 20))
)
  (let (
    (proposal (map-get? proposals { proposal-id: proposal-id }))
    (voter-power-record (map-get? voter-power { voter: tx-sender }))
    (voter-voting-power (if (is-some voter-power-record)
      (get total-voting-power (unwrap! voter-power-record (err ERR-NOT-FOUND)))
      u0
    ))
    (existing-vote (map-get? proposal-votes { proposal-id: proposal-id, voter: tx-sender }))
  )
    ;; Check proposal exists
    (asserts! (is-some proposal) (err ERR-INVALID-PROPOSAL))
    
    ;; Check voting hasn't started or already ended
    (asserts! (>= block-height (get start-block (unwrap! proposal (err ERR-NOT-FOUND)))) (err ERR-VOTING-NOT-STARTED))
    (asserts! (< block-height (get end-block (unwrap! proposal (err ERR-NOT-FOUND)))) (err ERR-PROPOSAL-CLOSED))
    
    ;; Check voter hasn't already voted
    (asserts! (is-none existing-vote) (err ERR-ALREADY-VOTED))
    
    ;; Check voter has voting power
    (asserts! (> voter-voting-power u0) (err ERR-INSUFFICIENT-VOTING-POWER))
    
    ;; Record vote
    (map-insert proposal-votes
      { proposal-id: proposal-id, voter: tx-sender }
      {
        vote-choice: vote-choice,
        voting-power-used: voter-voting-power,
        voted-at: block-height
      }
    )
    
    ;; Update proposal vote counts
    (let ((current-proposal (unwrap! proposal (err ERR-NOT-FOUND))))
      (if (is-eq vote-choice "for")
        (map-set proposals
          { proposal-id: proposal-id }
          (merge current-proposal { votes-for: (+ (get votes-for current-proposal) voter-voting-power) })
        )
        (if (is-eq vote-choice "against")
          (map-set proposals
            { proposal-id: proposal-id }
            (merge current-proposal { votes-against: (+ (get votes-against current-proposal) voter-voting-power) })
          )
          (map-set proposals
            { proposal-id: proposal-id }
            (merge current-proposal { abstained: (+ (get abstained current-proposal) voter-voting-power) })
          )
        )
      )
    )
    
    (ok true)
  )
)

;; Get proposal details
(define-read-only (get-proposal (proposal-id uint))
  (map-get? proposals { proposal-id: proposal-id })
)

;; Get user's vote on a proposal
(define-read-only (get-vote (proposal-id uint) (voter principal))
  (map-get? proposal-votes { proposal-id: proposal-id, voter: voter })
)

;; ============================================
;; GOVERNANCE PARAMETERS
;; ============================================

;; Update governance parameters (only owner)
(define-public (set-voting-period (min-period uint) (max-period uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-UNAUTHORIZED))
    (asserts! (< min-period max-period) (err ERR-INVALID-INPUT))
    (var-set min-voting-period min-period)
    (var-set max-voting-period max-period)
    (ok true)
  )
)

(define-public (set-quorum-percentage (percentage uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) (err ERR-UNAUTHORIZED))
    (asserts! (<= percentage u100) (err ERR-INVALID-INPUT))
    (var-set quorum-percentage percentage)
    (ok true)
  )
)

;; Get governance parameters
(define-read-only (get-min-voting-period)
  (var-get min-voting-period)
)

(define-read-only (get-max-voting-period)
  (var-get max-voting-period)
)

(define-read-only (get-quorum-percentage)
  (var-get quorum-percentage)
)

(define-read-only (get-proposal-counter)
  (var-get proposal-counter)
)
