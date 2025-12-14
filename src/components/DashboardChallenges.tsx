{challenges.map((challenge, idx) => (
  <motion.div
    key={challenge.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: idx * 0.1 }}
    whileHover={{
      scale: 1.03,
      boxShadow: "0 8px 32px 0 rgba(34,197,94,0.18), 0 1.5px 8px 0 rgba(0,0,0,0.10)",
      rotateX: 2
    }}
    className="relative rounded-2xl p-4 mb-4 overflow-hidden shadow-lg border border-white/30"
    style={{
      background: `linear-gradient(135deg, ${idx % 2 === 0 ? "#e0ffe0" : "#e0f7fa"} 0%, #fff 100%)`,
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      transition: "all 0.3s cubic-bezier(.25,.8,.25,1)"
    }}
  >
    {/* Optional shimmer overlay */}
    <div className="absolute inset-0 pointer-events-none" style={{
      background: "linear-gradient(120deg, transparent 60%, rgba(255,255,255,0.18) 100%)"
    }} />
    <div className="relative z-10">
      {/* ...your challenge content here... */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-green-700 text-lg">{challenge.title}</h4>
        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold shadow">{challenge.progress}/{challenge.target_amount}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <motion.div
          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (challenge.progress / challenge.target_amount) * 100)}%` }}
          transition={{ duration: 1 }}
        />
      </div>
      <div className="text-gray-700 text-sm">{challenge.description}</div>
      <div className="text-green-700 text-xs mt-1">Reward: +{challenge.reward_coins} R coins and +{challenge.reward_points} points</div>
    </div>
  </motion.div>
))}