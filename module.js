const adapter = await navigator.gpu.requestAdapter()
const device = await adapter.requestDevice()
const canvas = document.querySelector('canvas')

const { width, height } = canvas.getBoundingClientRect()
canvas.width = width * devicePixelRatio
canvas.height = height * devicePixelRatio

const context = canvas.getContext('gpupresent')
const format = context.getSwapChainPreferredFormat(adapter)
const swapChain = context.configureSwapChain({ device, format })

const code = `
[[stage(vertex)]]
fn vert([[builtin(vertex_index)]] index: u32) -> [[builtin(position)]] vec4<f32> {
    return array<vec4<f32>, 3>(
        vec4<f32>( 0f,  1f,  0f,  1f),
        vec4<f32>(-1f, -1f,  0f,  1f),
        vec4<f32>( 1f, -1f,  0f,  1f),
    )[index];
}
[[stage(fragment)]]
fn frag() -> [[location(0)]] vec4<f32> {
    return vec4<f32>(0f, 0f, 0f, 1f);
}`
const module = device.createShaderModule({ code })

const pipeline = device.createRenderPipeline({
  vertex: {
    module,
    entryPoint: 'vert',
  },
  fragment: {
    module,
    entryPoint: 'frag',
    targets: [{ format }],
  },
})

requestAnimationFrame(function frame() {
  requestAnimationFrame(frame)
  const encoder = device.createCommandEncoder()
  const pass = encoder.beginRenderPass({
    colorAttachments: [{
      view: swapChain.getCurrentTexture().createView(),
      loadValue: [1, 1, 1, 1],
      storeOp: 'clear',
    }],
  })
  pass.setPipeline(pipeline)
  pass.draw(3)
  pass.endPass()

  device.queue.submit([encoder.finish()])
})
