package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/TeneoProtocolAI/teneo-agent-sdk/pkg/agent"
	"github.com/TeneoProtocolAI/teneo-agent-sdk/pkg/nft"
)

type XAgent struct{}

func (a *XAgent) ProcessTask(ctx context.Context, task string) (string, error) {
	input := strings.ToLower(strings.TrimSpace(task))

	switch {

	case input == "trend":
		return "🔥 Trending:\nBTC pumping\nBase ecosystem hype\nNew airdrops incoming", nil

	case input == "airdrop":
		return "🎁 Airdrop Alpha:\nNUMO (Poseidon)\nReward: $25-$100\nLow competition", nil

	case input == "alpha":
		return "🚀 Early Alpha:\nCheck new Base ecosystem projects\nFarm testnets early\nFocus on low user platforms", nil

	default:
		return "Commands:\ntrend\nairdrop\nalpha", nil
	}
}

func main() {

	log.Println("🚀 Starting agent...")

	// Railway keep alive server (port change to avoid conflict)
	go func() {
		http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte("Agent running"))
		})
		http.ListenAndServe(":8090", nil)
	}()

	privateKey := os.Getenv("PRIVATE_KEY")
	if privateKey == "" {
		log.Fatal("❌ PRIVATE_KEY not set")
	}

	// Mint / Resume agent
	result, err := nft.Mint("x-agent.json")
	if err != nil {
		log.Fatal("Mint error:", err)
	}

	log.Println("✅ Mint done. Token ID:", result.TokenID)

	cfg := agent.DefaultConfig()
	cfg.Name = "X Trend Agent"
	cfg.Description = "Shows trends and airdrop alpha"
	cfg.PrivateKey = privateKey

	a, err := agent.NewEnhancedAgent(&agent.EnhancedAgentConfig{
		Config:       cfg,
		AgentHandler: &XAgent{},
		TokenID:      result.TokenID,
	})
	if err != nil {
		log.Fatal(err)
	}

	log.Println("🔥 Agent is running...")

	if err := a.Run(); err != nil {
		log.Fatal(err)
	}
}
