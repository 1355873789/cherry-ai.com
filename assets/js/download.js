document.addEventListener('DOMContentLoaded', function() {
    fetch('https://cherry.ocool.online/')
        .then(response => response.json())
        .then(data => {
            const version = data.version;
            const cleanVersion = version.replace(/^v/, '');
            const publishedAt = new Date(data.publishedAt).toLocaleDateString();
            const changelog = data.changelog;
            const downloads = data.downloads;

            // 检查是否为移动设备
            function isMobileDevice() {
                return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            }

            // 获取系统和架构信息
            function getSystemInfo() {
                if (isMobileDevice()) {
                    return null;
                }

                const ua = navigator.userAgent.toLowerCase();
                const platform = navigator.platform.toLowerCase();

                // Windows 系统检测
                if (ua.includes('windows') || platform.includes('win')) {
                    return {
                        name: `Cherry-Studio-${cleanVersion}-setup.exe`,
                        url: `https://cherrystudio.ocool.online/Cherry-Studio-${cleanVersion}-setup.exe`,
                        type: 'Windows',
                        arch: ua.includes('win64') || ua.includes('wow64') ? 'x64' : 'x86'
                    };
                }
                
                // macOS 系统检测
                if (ua.includes('mac') || platform.includes('mac')) {
                    // 检测是否为 Apple Silicon
                    const isAppleSilicon = ua.includes('arm64') || ua.includes('mac') && window.navigator.cpuClass === 'arm64';
                    
                    return {
                        name: `Cherry-Studio-${cleanVersion}-${isAppleSilicon ? 'arm64' : 'x64'}.dmg`,
                        url: `https://cherrystudio.ocool.online/Cherry-Studio-${cleanVersion}-${isAppleSilicon ? 'arm64' : 'x64'}.dmg`,
                        type: `macOS (${isAppleSilicon ? 'M芯片' : 'Intel芯片'})`,
                        arch: isAppleSilicon ? 'arm64' : 'x64'
                    };
                }

                // Linux 系统检测
                if (ua.includes('linux') || platform.includes('linux')) {
                    return {
                        name: `Cherry-Studio-${cleanVersion}-x86_64.AppImage`,
                        url: `https://cherrystudio.ocool.online/Cherry-Studio-${cleanVersion}-x86_64.AppImage`,
                        type: 'Linux',
                        arch: 'x86_64'
                    };
                }

                return null;
            }

            // 修改 downloadUrls 对象结构
            const downloadUrls = {
                windows: {
                    title: 'Windows系统安装包',
                    items: [
                        {
                            name: `Cherry-Studio-${cleanVersion}-setup.exe`,
                            url: `https://cherrystudio.ocool.online/Cherry-Studio-${cleanVersion}-setup.exe`,
                            desc: 'Windows标准安装包'
                        },
                        {
                            name: `Cherry-Studio-${cleanVersion}-portable.exe`,
                            url: `https://cherrystudio.ocool.online/Cherry-Studio-${cleanVersion}-portable.exe`,
                            desc: 'Windows便携版'
                        }
                    ]
                },
                macos: {
                    title: 'MacOS系统安装包',
                    items: [
                        {
                            name: `Cherry-Studio-${cleanVersion}-x64.dmg`,
                            url: `https://cherrystudio.ocool.online/Cherry-Studio-${cleanVersion}-x64.dmg`,
                            desc: 'Intel芯片Mac'
                        },
                        {
                            name: `Cherry-Studio-${cleanVersion}-arm64.dmg`,
                            url: `https://cherrystudio.ocool.online/Cherry-Studio-${cleanVersion}-arm64.dmg`,
                            desc: 'Apple Silicon芯片Mac'
                        }
                    ]
                },
                linux: {
                    title: 'Linux系统安装包',
                    items: [
                        {
                            name: `Cherry-Studio-${cleanVersion}-x86_64.AppImage`,
                            url: `https://cherrystudio.ocool.online/Cherry-Studio-${cleanVersion}-x86_64.AppImage`,
                            desc: 'x86_64架构'
                        },
                        {
                            name: `Cherry-Studio-${cleanVersion}-arm64.AppImage`,
                            url: `https://cherrystudio.ocool.online/Cherry-Studio-${cleanVersion}-arm64.AppImage`,
                            desc: 'ARM架构'
                        }
                    ]
                }
            };

            const systemInfo = getSystemInfo();

            // 更新页面标题和发布时间
            document.getElementById('version-title').textContent = `Cherry Studio ${version}`;
            document.getElementById('published-at').textContent = `发布时间：${publishedAt}`;

            // 获取下载按钮容器
            const downloadButtons = document.querySelector('.download-buttons');

            // 如果是移动设备或无法匹配系统，隐藏主下载区域
            if (!systemInfo) {
                downloadButtons.style.display = 'none';
            } else {
                // 设置系统提示和下载信息
                const systemInfoElement = document.createElement('div');
                systemInfoElement.className = 'system-info';
                const matchedDownload = downloads.find(item => 
                    item.name.toLowerCase().includes(systemInfo.name.toLowerCase())
                );
                systemInfoElement.innerHTML = `
                    <p>您的系统为 <strong>${systemInfo.type}</strong></p>
                    <p>建议下载 <strong>${systemInfo.name}</strong>${matchedDownload ? ` (${matchedDownload.size})` : ''}</p>
                `;
                
                // 插入系统信息
                downloadButtons.insertBefore(systemInfoElement, downloadButtons.firstChild);

                // 设置主下载按钮
                const mainDownloadBtn = document.getElementById('main-download-btn');
                mainDownloadBtn.textContent = '立即下载';
                mainDownloadBtn.addEventListener('click', function() {
                    window.location.href = systemInfo.url;
                });
            }

            // 显示更新日志
            const changelogElement = document.getElementById('changelog');
            changelogElement.innerHTML = `
                <div class="changelog-header">
                    <h2>更新日志</h2>
                    <p class="changelog-version">版本 ${version}</p>
                </div>
                <div class="changelog-content">
                    ${marked.parse(changelog)}
                </div>
            `;

            // 修改显示其他版本下载链接的逻辑
            const downloadList = document.getElementById('download-list');
            downloadList.innerHTML = ''; // 清空现有内容

            // 遍历显示所有下载链接
            Object.values(downloadUrls).forEach(({ title, items }) => {
                // 创建系统类别标题
                const groupTitle = document.createElement('h3');
                groupTitle.textContent = title;
                groupTitle.style.marginTop = '20px';
                downloadList.appendChild(groupTitle);

                // 创建该系统下的所有下载项
                items.forEach(({ name, url, desc }) => {
                    const li = document.createElement('li');
                    const button = document.createElement('button');
                    button.className = 'download-item-btn';
                    
                    // 查找匹配的下载信息以获取文件大小
                    const matchedDownload = downloads.find(item => {
                        // 添加调试日志
                        console.log('Comparing:', {
                            downloadName: item.name.toLowerCase(),
                            searchName: name.toLowerCase()
                        });
                        return item.name.toLowerCase().includes(name.toLowerCase());
                    });
                    
                    // 如果没找到匹配项，也记录一下
                    if (!matchedDownload) {
                        console.log('No size found for:', name);
                        console.log('Available downloads:', downloads);
                    }
                    
                    // 构建按钮文本
                    const buttonText = `${name}${matchedDownload ? ` (${matchedDownload.size})` : ''} - ${desc}`;
                    button.textContent = buttonText;
                    
                    button.addEventListener('click', function() {
                        window.location.href = url;
                    });
                    
                    li.appendChild(button);
                    downloadList.appendChild(li);
                });
            });
        })
        .catch(error => {
            console.error('获取版本信息失败：', error);
            document.getElementById('version-title').textContent = '无法获取版本信息，请稍后重试';
        });
});

// 检测系统信息
function detectSystem() {
    const platform = navigator.platform.toLowerCase();
    const userAgent = navigator.userAgent.toLowerCase();
    let systemName = '';
    let recommendedVersion = '';
    let architecture = '';

    // 检测 Windows 系统
    if (userAgent.includes('win')) {
        systemName = 'Windows';
        // 检测 Windows 架构
        if (userAgent.includes('win64') || userAgent.includes('wow64')) {
            architecture = '64位';
            systemName = 'Windows (64位)';
        } else if (userAgent.includes('win32')) {
            architecture = '32位';
            systemName = 'Windows (32位)';
        }
    } 
    // 检测 macOS 系统
    else if (userAgent.includes('mac')) {
        systemName = 'macOS';
        // 检测 Mac 芯片
        if (userAgent.includes('arm') || userAgent.includes('aarch64')) {
            architecture = 'Apple Silicon';
            systemName = 'macOS (Apple Silicon)';
        } else {
            architecture = 'Intel';
            systemName = 'macOS (Intel)';
        }
    } 
    // 检测 Linux 系统
    else if (userAgent.includes('linux')) {
        systemName = 'Linux';
        // 检测 Linux 架构
        if (userAgent.includes('x86_64') || userAgent.includes('amd64')) {
            architecture = 'x86_64';
            systemName = 'Linux (x86_64)';
        } else if (userAgent.includes('aarch64')) {
            architecture = 'ARM64';
            systemName = 'Linux (ARM64)';
        } else if (userAgent.includes('armv7')) {
            architecture = 'ARM32';
            systemName = 'Linux (ARM32)';
        }
    } else {
        systemName = '未知系统';
        architecture = '未知架构';
    }

    // 更新系统名称
    document.getElementById('system-name').textContent = systemName;

    // 从 API 获取最新版本信息
    fetch('https://api.github.com/repos/kangfenmao/cherry-studio/releases/latest')
        .then(response => response.json())
        .then(data => {
            const version = data.tag_name;
            // 根据系统和架构设置对应的文件名
            if (userAgent.includes('win')) {
                if (architecture === '64位') {
                    recommendedVersion = `Cherry-Studio-${version}-win-x64.exe`;
                } else {
                    recommendedVersion = `Cherry-Studio-${version}-win-ia32.exe`;
                }
            } else if (userAgent.includes('mac')) {
                if (architecture === 'Apple Silicon') {
                    recommendedVersion = `Cherry-Studio-${version}-mac-arm64.dmg`;
                } else {
                    recommendedVersion = `Cherry-Studio-${version}-mac-x64.dmg`;
                }
            } else if (userAgent.includes('linux')) {
                if (architecture === 'x86_64') {
                    recommendedVersion = `Cherry-Studio-${version}-linux-x64.AppImage`;
                } else if (architecture === 'ARM64') {
                    recommendedVersion = `Cherry-Studio-${version}-linux-arm64.AppImage`;
                } else {
                    recommendedVersion = `Cherry-Studio-${version}-linux-armv7l.AppImage`;
                }
            } else {
                recommendedVersion = `Cherry-Studio-${version}-universal.zip`;
            }
            document.getElementById('recommended-version').textContent = recommendedVersion;
        })
        .catch(error => {
            console.error('获取版本信息失败：', error);
            document.getElementById('recommended-version').textContent = '获取版本信息失败';
        });
    
    // 显示系统信息区域
    document.querySelector('.system-info').classList.add('loaded');
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    detectSystem();
});
